'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package, ShoppingBag, Users, DollarSign,
  TrendingUp, Plus, Edit, Eye
} from 'lucide-react';
import { adminAPI, orderAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: Order[];
  ordersByStatus: { _id: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    adminAPI.getStats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== 'admin') return null;

  const statCards = stats ? [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign className="w-6 h-6" />, color: 'bg-green-500', change: '+12% this month' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-blue-500', change: `${stats.ordersByStatus.find(o => o._id === 'pending')?.count || 0} pending` },
    { label: 'Total Products', value: stats.totalProducts, icon: <Package className="w-6 h-6" />, color: 'bg-mocha-500', change: 'Active listings' },
    { label: 'Total Customers', value: stats.totalUsers, icon: <Users className="w-6 h-6" />, color: 'bg-purple-500', change: 'Registered users' },
  ] : [];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Admin Header */}
      <div className="bg-[#3a2e1e] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">🕯️ Rachvi Creation Admin</h1>
          <p className="text-cream-400 text-xs">Welcome back, {user.name}</p>
        </div>
        <Link href="/" className="text-cream-300 hover:text-white text-sm transition-colors">
          ← View Store
        </Link>
      </div>

      {/* Admin Nav */}
      <div className="bg-mocha-800 text-cream-200 px-6 py-2 flex gap-6 overflow-x-auto">
        {[
          { href: '/admin', label: 'Dashboard', icon: '📊' },
          { href: '/admin/products', label: 'Products', icon: '🕯️' },
          { href: '/admin/orders', label: 'Orders', icon: '📦' },
          { href: '/admin/users', label: 'Users', icon: '👥' },
        ].map((nav) => (
          <Link
            key={nav.href}
            href={nav.href}
            className="text-sm font-medium hover:text-white transition-colors whitespace-nowrap py-1"
          >
            {nav.icon} {nav.label}
          </Link>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.label} className="bg-white rounded-2xl shadow-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-white`}>
                      {card.icon}
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="font-display text-2xl font-bold text-[#3a2e1e]">{card.value}</p>
                  <p className="text-mocha-400 text-xs mt-1">{card.label}</p>
                  <p className="text-green-600 text-xs mt-0.5">{card.change}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Link href="/admin/products/new" className="flex items-center gap-3 bg-mocha-700 text-white rounded-2xl p-5 hover:bg-mocha-800 transition-colors">
                <Plus className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Add New Product</p>
                  <p className="text-cream-300 text-xs">Upload candle with images</p>
                </div>
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-3 bg-blue-600 text-white rounded-2xl p-5 hover:bg-blue-700 transition-colors">
                <Package className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Manage Orders</p>
                  <p className="text-blue-200 text-xs">Update order statuses</p>
                </div>
              </Link>
              <Link href="/admin/products" className="flex items-center gap-3 bg-green-600 text-white rounded-2xl p-5 hover:bg-green-700 transition-colors">
                <Edit className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Edit Products</p>
                  <p className="text-green-200 text-xs">Update prices and stock</p>
                </div>
              </Link>
            </div>

            {/* Recent Orders Table */}
            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="p-5 border-b border-cream-200 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-[#3a2e1e]">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-mocha-600 text-sm hover:text-mocha-800">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-cream-50">
                      <tr>
                        {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date', ''].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-mocha-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-cream-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono text-mocha-600">
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#3a2e1e]">
                            {typeof order.user === 'object' ? order.user.name : 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#3a2e1e]">
                            ₹{order.totalPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {order.isPaid ? 'Paid' : order.paymentMethod === 'cod' ? 'COD' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.orderStatus] || ''}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-mocha-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/orders?id=${order._id}`} className="text-mocha-500 hover:text-mocha-700">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
