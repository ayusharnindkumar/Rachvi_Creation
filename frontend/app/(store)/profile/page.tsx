'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Package, Heart, MapPin, Lock, LogOut, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderAPI, authAPI, productAPI } from '@/lib/api';
import { Order, Product } from '@/types';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 flex items-center justify-center"><p className="text-mocha-400">Loading...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (activeTab === 'orders') {
      setIsLoading(true);
      orderAPI.getMyOrders().then((res) => setOrders(res.data.orders || [])).catch(() => {}).finally(() => setIsLoading(false));
    }
    if (activeTab === 'wishlist' && user?.wishlist?.length) {
      Promise.all(user.wishlist.map((id) => productAPI.getOne(id)))
        .then((responses) => setWishlistProducts(responses.map((r) => r.data.product)))
        .catch(() => {});
    }
  }, [activeTab, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'orders', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-5 text-center mb-4">
              <div className="w-16 h-16 bg-mocha-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-mocha-700 font-bold text-2xl">
                  {user.name[0]?.toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-[#3a2e1e]">{user.name}</p>
              <p className="text-mocha-400 text-xs mt-0.5">{user.email}</p>
              {user.role === 'admin' && (
                <Link href="/admin" className="mt-2 inline-block text-xs text-mocha-600 font-medium bg-mocha-100 px-3 py-1 rounded-full">
                  ⚙️ Admin Panel
                </Link>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-mocha-50 text-mocha-700 border-r-2 border-mocha-600'
                      : 'text-mocha-500 hover:bg-cream-50 hover:text-mocha-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-t border-cream-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-semibold text-[#3a2e1e] mb-5">
                  Personal Information
                </h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Email</label>
                    <input type="email" value={user.email} className="input-field opacity-60" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-[#3a2e1e]">My Orders</h2>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                    <Package className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                    <p className="text-mocha-500">No orders yet. Start shopping! 🕯️</p>
                    <Link href="/shop" className="btn-primary mt-4 inline-flex">Browse Candles</Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Link href={`/order/${order._id}`} key={order._id}>
                      <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-mono text-xs text-mocha-400">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-mocha-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'long', day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                              {order.orderStatus}
                            </span>
                            <p className="font-bold text-[#3a2e1e] mt-1">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {order.orderItems.map((item, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                          ))}
                          <ChevronRight className="w-4 h-4 text-mocha-400 ml-auto shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="font-display text-xl font-semibold text-[#3a2e1e] mb-5">
                  My Wishlist ({user.wishlist?.length || 0})
                </h2>
                {!user.wishlist?.length ? (
                  <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                    <Heart className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                    <p className="text-mocha-500">Your wishlist is empty. Start adding candles! ♡</p>
                    <Link href="/shop" className="btn-primary mt-4 inline-flex">Browse Candles</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => (
                      <Link key={product._id} href={`/product/${product.slug}`}>
                        <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all">
                          <div className="relative aspect-square">
                            <Image src={product.images[0]?.url || ''} alt={product.name} fill className="object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-[#3a2e1e] text-sm line-clamp-2">{product.name}</p>
                            <p className="font-bold text-[#3a2e1e] mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <ChangePasswordForm />
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-semibold text-[#3a2e1e] mb-5">
                  Saved Addresses
                </h2>
                {user.addresses?.length === 0 ? (
                  <p className="text-mocha-500 text-sm">No saved addresses yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {user.addresses?.map((addr, i) => (
                      <div key={i} className="border border-cream-200 rounded-xl p-4 text-sm text-mocha-600">
                        <p className="font-semibold text-[#3a2e1e]">{addr.name}</p>
                        <p>{addr.phone}</p>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.isDefault && (
                          <span className="mt-2 inline-block text-xs bg-mocha-100 text-mocha-700 px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display text-xl font-semibold text-[#3a2e1e] mb-5">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {[
          { name: 'currentPassword', label: 'Current Password', placeholder: 'Your current password' },
          { name: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters' },
          { name: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat new password' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">{field.label}</label>
            <input
              type="password"
              value={form[field.name as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
              className="input-field"
              placeholder={field.placeholder}
              required
            />
          </div>
        ))}
        <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-70">
          {isLoading ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
