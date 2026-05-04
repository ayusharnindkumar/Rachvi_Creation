'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return;
    setIsLoading(true);
    const success = await register(form);
    if (success) router.push('/');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
          alt="Gift Candles"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3a2e1e]/60 to-transparent flex items-center">
          <div className="p-12 text-white">
            <h2 className="font-display text-4xl font-bold mb-4">
              Join Our Community 🕯️
            </h2>
            <p className="text-cream-200 text-lg leading-relaxed">
              Create an account to save your favorite candles, track orders, and get exclusive member discounts.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/logo.png" alt="Rachvi Creation" width={80} height={80} className="mx-auto mb-3" />
            </Link>
            <h1 className="font-display text-3xl font-bold text-[#3a2e1e]">Create Account</h1>
            <p className="text-mocha-500 text-sm mt-1">Join the Rachvi Creation family</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Full Name *</label>
              <input
                type="text"
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Email Address *</label>
              <input
                type="email"
                name="email"
                id="email-register"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password-register"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400 hover:text-mocha-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-70"
            >
              {isLoading ? '⏳ Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-mocha-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-mocha-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
