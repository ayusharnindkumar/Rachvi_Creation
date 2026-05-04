'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, MessageCircle } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { Order } from '@/types';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      orderAPI.getOne(orderId).then((res) => setOrder(res.data.order)).catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>

        <h1 className="font-display text-3xl font-bold text-[#3a2e1e] mb-2">
          Order Placed! 🎉
        </h1>
        <p className="text-mocha-500 mb-6 leading-relaxed">
          Thank you for your order! We&apos;ve received it and will start preparing your
          handcrafted candles with love. 🕯️
        </p>

        {order && (
          <div className="bg-white rounded-2xl shadow-card p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-mocha-500">Order ID</span>
              <span className="font-mono font-medium text-[#3a2e1e] text-xs">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mocha-500">Total</span>
              <span className="font-bold text-[#3a2e1e]">
                ₹{order.totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mocha-500">Payment</span>
              <span className="text-[#3a2e1e] capitalize">
                {order.paymentMethod === 'cod' ? '🚚 Cash on Delivery' : '💳 Online'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mocha-500">Status</span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                {order.orderStatus}
              </span>
            </div>
          </div>
        )}

        <div className="bg-cream-100 rounded-xl p-4 mb-6 text-sm text-mocha-600">
          <Package className="w-5 h-5 inline mr-2 text-mocha-500" />
          Estimated delivery: <strong>3-5 business days</strong>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/profile?tab=orders" className="btn-primary justify-center py-3">
            Track Your Order <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`https://wa.me/919876543210?text=Hi! I placed an order. Please confirm.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Contact on WhatsApp
          </a>
          <Link href="/shop" className="btn-outline justify-center py-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 skeleton rounded-full mx-auto mb-4" />
          <p className="text-mocha-400">Loading your order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
