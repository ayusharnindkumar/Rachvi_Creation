'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      router.push(redirect);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left: Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1612198273689-5e22faefed56?w=800&q=80"
          alt="Rachvi Creation Candles"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3a2e1e]/60 to-transparent flex items-center">
          <div className="p-12 text-white">
            <h2 className="font-display text-4xl font-bold mb-4">
              Welcome Back! 🕯️
            </h2>
            <p className="text-cream-200 text-lg leading-relaxed">
              Login to access your wishlist, track orders, and enjoy exclusive offers from Rachvi Creation.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Rachvi Creation"
                width={80}
                height={80}
                className="mx-auto mb-3"
              />
            </Link>
            <h1 className="font-display text-3xl font-bold text-[#3a2e1e]">Sign In</h1>
            <p className="text-mocha-500 text-sm mt-1">Welcome back to Rachvi Creation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a2e1e] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
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
              {isLoading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-mocha-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-mocha-700 font-semibold hover:underline">
              Create Account
            </Link>
          </p>

          {/* Demo Admin Credentials */}
          <div className="mt-6 p-3 bg-cream-100 rounded-xl border border-cream-200 text-xs text-mocha-500 text-center">
            <p className="font-medium text-mocha-700 mb-1">🔑 Demo Admin Access</p>
            <p>admin@rachvicreation.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 flex items-center justify-center"><div className="skeleton w-full max-w-md h-96 rounded-3xl" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
