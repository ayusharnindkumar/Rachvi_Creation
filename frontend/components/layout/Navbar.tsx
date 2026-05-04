'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Detect scroll for navbar background change
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=gift-set', label: 'Gift Sets' },
    { href: '/shop?category=festive', label: 'Festive' },
    { href: '/shop?category=matka', label: 'Matka Candles' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-md border-b border-cream-200'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-full overflow-hidden ring-2 ring-mocha-300 shadow-md bg-cream-100 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Rachvi Creation Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-lg font-semibold text-[#3a2e1e] leading-none">
                  Rachvi Creation
                </p>
                <p className="text-xs text-mocha-500 tracking-widest font-sans uppercase">
                  Handcrafted Candles
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${
                    pathname === link.href ? 'text-mocha-600 font-semibold' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-cream-200 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-[#3a2e1e]" />
              </button>

              {/* Wishlist */}
              <Link
                href={isAuthenticated ? '/profile?tab=wishlist' : '/login'}
                className="p-2 rounded-full hover:bg-cream-200 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-[#3a2e1e]" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-cream-200 transition-colors"
                aria-label={`Cart - ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5 text-[#3a2e1e]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-mocha-700 text-white text-xs rounded-full flex items-center justify-center font-bold cart-bounce">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-cream-200 transition-colors"
                  >
                    <div className="w-8 h-8 bg-mocha-200 rounded-full flex items-center justify-center">
                      <span className="text-mocha-700 font-semibold text-sm">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-mocha-600" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-cream-200 py-2 animate-slide-up">
                      <p className="px-4 py-2 text-xs text-mocha-400 font-medium truncate">{user?.email}</p>
                      <hr className="border-cream-200 my-1" />
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-[#3a2e1e] hover:bg-cream-100">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/profile?tab=orders" className="flex items-center gap-2 px-4 py-2 text-sm text-[#3a2e1e] hover:bg-cream-100">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-mocha-600 font-medium hover:bg-cream-100">
                          ⚙️ Admin Panel
                        </Link>
                      )}
                      <hr className="border-cream-200 my-1" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hidden md:block btn-primary text-xs px-4 py-2">
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="lg:hidden p-2 rounded-full hover:bg-cream-200 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-cream-50/98 backdrop-blur-md border-t border-cream-200 animate-slide-up">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pathname === link.href
                      ? 'bg-mocha-100 text-mocha-700'
                      : 'text-[#3a2e1e] hover:bg-cream-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-cream-200 my-2" />
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="block px-4 py-3 text-sm text-[#3a2e1e] hover:bg-cream-200 rounded-xl">👤 Profile</Link>
                  <Link href="/profile?tab=orders" className="block px-4 py-3 text-sm text-[#3a2e1e] hover:bg-cream-200 rounded-xl">📦 My Orders</Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-3 text-sm text-mocha-600 font-medium hover:bg-cream-200 rounded-xl">⚙️ Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl">🚪 Logout</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="btn-primary flex-1 text-center text-sm">Login</Link>
                  <Link href="/register" className="btn-secondary flex-1 text-center text-sm">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search className="w-5 h-5 text-mocha-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candles, fragrances..."
                className="flex-1 text-lg bg-transparent outline-none text-[#3a2e1e] placeholder-mocha-300"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-full hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {['lavender', 'rose', 'coffee', 'vanilla', 'matka candle', 'gift set'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(term)}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-3 py-1.5 bg-cream-100 text-mocha-600 rounded-full text-sm hover:bg-cream-200 transition-colors capitalize"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
