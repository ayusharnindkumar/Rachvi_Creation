'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Search, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
    else fetchOrders();
  }, [user, filterStatus]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus, limit: 50 } : { limit: 50 };
      const res = await orderAPI.getAll(params);
      setOrders(res.data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus, trackingNumber });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const searchLower = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(searchLower) ||
      (typeof o.user === 'object' && o.user.name?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-[#3a2e1e] text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-cream-300 hover:text-white text-sm">← Dashboard</Link>
        <h1 className="font-display text-xl font-bold">Order Management</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                !filterStatus ? 'bg-mocha-700 text-white' : 'bg-white border border-cream-300 text-mocha-600'
              }`}
            >
              All
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  filterStatus === s ? 'bg-mocha-700 text-white' : 'bg-white border border-cream-300 text-mocha-600 hover:border-mocha-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-mocha-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                {/* Order Header */}
                <div
                  className="p-5 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-cream-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-medium text-[#3a2e1e]">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_COLORS[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isPaid ? '✅ Paid' : order.paymentMethod === 'cod' ? '🚚 COD' : '⏳ Unpaid'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-mocha-400">
                      <span>
                        {typeof order.user === 'object' ? order.user.name : 'Customer'}
                        {typeof order.user === 'object' && order.user.email ? ` • ${order.user.email}` : ''}
                      </span>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#3a2e1e]">₹{order.totalPrice.toLocaleString('en-IN')}</span>

                    {/* Status Update Dropdown */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm text-[#3a2e1e] outline-none cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha-400 pointer-events-none" />
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-mocha-400 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order._id && (
                  <div className="border-t border-cream-200 p-5 bg-cream-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-semibold text-[#3a2e1e] text-sm mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.orderItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-cream-200 shrink-0">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 text-sm">
                                <p className="font-medium text-[#3a2e1e] line-clamp-1">{item.name}</p>
                                <p className="text-mocha-400 text-xs">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-[#3a2e1e]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-cream-200 text-sm space-y-1">
                          <div className="flex justify-between text-mocha-500">
                            <span>Subtotal</span>
                            <span>₹{order.itemsPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-mocha-500">
                            <span>Shipping</span>
                            <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                          </div>
                          <div className="flex justify-between font-bold text-[#3a2e1e]">
                            <span>Total</span>
                            <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold text-[#3a2e1e] text-sm mb-3">Delivery Address</h4>
                        <div className="text-sm text-mocha-600 bg-white rounded-xl p-3">
                          <p className="font-semibold text-[#3a2e1e]">{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.phone}</p>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                          <p>Pincode: {order.shippingAddress.pincode}</p>
                        </div>

                        {/* Tracking Number Input */}
                        {['shipped', 'confirmed', 'processing'].includes(order.orderStatus) && (
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-mocha-500 mb-1">Tracking Number</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                defaultValue={order.trackingNumber || ''}
                                onBlur={(e) => {
                                  if (e.target.value !== order.trackingNumber) {
                                    handleStatusUpdate(order._id, order.orderStatus, e.target.value);
                                  }
                                }}
                                className="input-field flex-1 text-sm py-2"
                                placeholder="Enter tracking number..."
                              />
                            </div>
                          </div>
                        )}

                        {/* WhatsApp customer */}
                        {typeof order.user === 'object' && order.user.phone && (
                          <a
                            href={`https://wa.me/${order.user.phone.replace(/[^0-9]/g, '')}?text=Hi ${order.user.name}! Your Rachvi Creation order #${order._id.slice(-8).toUpperCase()} is ${order.orderStatus}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            💬 WhatsApp Customer
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
