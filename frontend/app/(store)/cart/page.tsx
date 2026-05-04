'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();

  const shippingPrice = totalPrice >= 500 ? 0 : 60;
  const grandTotal = totalPrice + shippingPrice;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-mocha-400" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#3a2e1e] mb-2">
            Your cart is empty
          </h2>
          <p className="text-mocha-500 mb-6">
            Looks like you haven&apos;t added any candles yet. Start shopping to fill it up! 🕯️
          </p>
          <Link href="/shop" className="btn-primary">
            Browse Candles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-[#3a2e1e] mb-8">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product._id} className="bg-white rounded-2xl shadow-card p-4 flex gap-4">
                {/* Product Image */}
                <Link href={`/product/${item.product.slug}`} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-cream-100">
                  <Image
                    src={item.product.images[0]?.url || ''}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${item.product.slug}`}>
                        <h3 className="font-semibold text-[#3a2e1e] text-sm md:text-base hover:text-mocha-600 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-mocha-400 text-xs capitalize mt-0.5">
                        {item.product.category} • {item.product.fragrance}
                      </p>
                      {item.product.weight && (
                        <p className="text-mocha-400 text-xs">{item.product.weight}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-mocha-300 hover:text-red-400 transition-colors shrink-0 p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-0 bg-cream-100 rounded-lg overflow-hidden border border-cream-200">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-cream-200 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-mocha-600" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-[#3a2e1e]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-cream-200 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3 text-mocha-600" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-[#3a2e1e]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-mocha-400 text-xs">
                          ₹{item.product.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link href="/shop" className="inline-flex items-center gap-2 text-mocha-600 text-sm font-medium hover:text-mocha-800 transition-colors">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-[#3a2e1e] mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-mocha-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-mocha-600">
                  <span>Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                {shippingPrice > 0 && (
                  <p className="text-xs text-mocha-400">
                    Add ₹{(500 - totalPrice).toLocaleString('en-IN')} more for free shipping
                  </p>
                )}
                <div className="border-t border-cream-200 pt-3">
                  <div className="flex justify-between font-bold text-[#3a2e1e] text-base">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-mocha-400 text-xs mt-1">Inclusive of all taxes</p>
                </div>
              </div>

              {/* Coupon (placeholder) */}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-cream-50 border border-cream-200 rounded-xl px-3 py-2">
                  <Tag className="w-4 h-4 text-mocha-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="bg-transparent text-sm text-[#3a2e1e] placeholder-mocha-300 outline-none flex-1"
                  />
                </div>
                <button className="btn-outline text-xs px-4 py-2 whitespace-nowrap">Apply</button>
              </div>

              {/* Checkout Button */}
              <div className="mt-5 space-y-3">
                {isAuthenticated ? (
                  <Link href="/checkout" className="btn-primary w-full justify-center py-3.5 text-base">
                    Proceed to Checkout <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link href="/login?redirect=/checkout" className="btn-primary w-full justify-center py-3.5 text-base">
                      Login to Checkout
                    </Link>
                    <p className="text-center text-mocha-400 text-xs">
                      Don&apos;t have an account?{' '}
                      <Link href="/register" className="text-mocha-600 font-medium">Register</Link>
                    </p>
                  </>
                )}

                <a
                  href={`https://wa.me/919876543210?text=Hi! I'd like to order:${items.map(i => `%0A• ${i.product.name} x${i.quantity} = ₹${i.product.price * i.quantity}`).join('')}%0ATotal: ₹${grandTotal}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
                >
                  💬 Order via WhatsApp
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-cream-200 grid grid-cols-3 gap-2 text-center">
                {['🔒 Secure Payment', '🚚 Fast Delivery', '↩️ Easy Returns'].map((badge) => (
                  <div key={badge} className="text-xs text-mocha-400">{badge}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
