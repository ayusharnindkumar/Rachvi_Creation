'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/lib/api';
import { Address } from '@/types';
import toast from 'react-hot-toast';
import { Check, CreditCard, Truck, MapPin } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const STEPS = ['Address', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0); // 0: Address, 1: Payment, 2: Confirm
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [address, setAddress] = useState<Address>({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const shippingPrice = totalPrice >= 500 ? 0 : 60;
  const grandTotal = totalPrice + shippingPrice;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [isAuthenticated, items, router]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all address fields');
      return;
    }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Create order in our backend
      const orderData = {
        orderItems: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
      };

      const orderRes = await orderAPI.create(orderData);
      const order = orderRes.data.order;
      setOrderId(order._id);

      if (paymentMethod === 'cod') {
        // COD - direct success
        clearCart();
        router.push(`/order-success?orderId=${order._id}`);
        return;
      }

      // Razorpay payment flow
      const razorpayRes = await orderAPI.createRazorpay(grandTotal);
      const rzpOrder = razorpayRes.data.order;

      const options = {
        key: razorpayRes.data.key,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'Rachvi Creation',
        description: 'Handcrafted Candles',
        image: '/logo.png',
        order_id: rzpOrder.id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await orderAPI.verifyPayment(order._id, response);
            clearCart();
            router.push(`/order-success?orderId=${order._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: address.phone,
        },
        theme: {
          color: '#9e7043',
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-[#3a2e1e] mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < step
                      ? 'bg-mocha-700 text-white'
                      : i === step
                      ? 'bg-mocha-600 text-white ring-4 ring-mocha-200'
                      : 'bg-cream-200 text-mocha-400'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-mocha-700' : 'text-mocha-400'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 transition-all ${i < step ? 'bg-mocha-600' : 'bg-cream-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Steps */}
          <div className="lg:col-span-2">
            {/* STEP 0: Address */}
            {step === 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-semibold text-[#3a2e1e] mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-mocha-500" /> Delivery Address
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={address.name}
                        onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                        className="input-field"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                        className="input-field"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Street Address *</label>
                    <textarea
                      value={address.street}
                      onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                      className="input-field resize-none"
                      rows={2}
                      placeholder="House no, building name, street, landmark..."
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">City *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                        className="input-field"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">State *</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                        className="input-field"
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Pincode *</label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                        className="input-field"
                        placeholder="400001"
                        pattern="[0-9]{6}"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3.5">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-semibold text-[#3a2e1e] mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-mocha-500" /> Payment Method
                </h2>

                <div className="space-y-3 mb-6">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay' ? 'border-mocha-500 bg-mocha-50' : 'border-cream-200 hover:border-mocha-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-mocha-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#3a2e1e] text-sm">💳 Razorpay</p>
                      <p className="text-mocha-400 text-xs">Credit/Debit Card, UPI, NetBanking, Wallets</p>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">UPI</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Card</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-mocha-500 bg-mocha-50' : 'border-cream-200 hover:border-mocha-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-mocha-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#3a2e1e] text-sm flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Cash on Delivery
                      </p>
                      <p className="text-mocha-400 text-xs">Pay when your order arrives</p>
                    </div>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">COD</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1 justify-center py-3">
                    ← Back
                  </button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center py-3">
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Confirm */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Address Summary */}
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#3a2e1e] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-mocha-500" /> Delivery Address
                    </h3>
                    <button onClick={() => setStep(0)} className="text-mocha-500 text-sm hover:text-mocha-700">Edit</button>
                  </div>
                  <p className="text-sm text-mocha-600">
                    <strong>{address.name}</strong> • {address.phone}<br />
                    {address.street}<br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#3a2e1e] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-mocha-500" /> Payment
                    </h3>
                    <button onClick={() => setStep(1)} className="text-mocha-500 text-sm hover:text-mocha-700">Edit</button>
                  </div>
                  <p className="text-sm text-mocha-600">
                    {paymentMethod === 'razorpay' ? '💳 Online Payment via Razorpay' : '🚚 Cash on Delivery'}
                  </p>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="btn-gold w-full justify-center py-4 text-base disabled:opacity-70"
                >
                  {isSubmitting ? '⏳ Processing...' : `Place Order • ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
                <button onClick={() => setStep(1)} className="btn-outline w-full justify-center py-3">
                  ← Back
                </button>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
              <h3 className="font-display text-lg font-semibold text-[#3a2e1e] mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-mocha-700 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3a2e1e] line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-mocha-400">₹{item.product.price.toLocaleString('en-IN')} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#3a2e1e] shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-mocha-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-mocha-600">
                  <span>Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#3a2e1e] text-base pt-2 border-t border-cream-200">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
