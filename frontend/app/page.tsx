'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, Package, Star, Sparkles, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productAPI } from '@/lib/api';
import { Product } from '@/types';

// Sample testimonials
const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Absolutely obsessed with the Lavender Bliss candle! The fragrance fills my entire room and it burns so evenly. Best candle I have ever bought in India!',
    avatar: 'PS',
  },
  {
    id: 2,
    name: 'Ananya Gupta',
    location: 'Delhi',
    rating: 5,
    text: 'Gifted the festive trio set to my mom and she loved it! The packaging is gorgeous and the candles smell divine. Will definitely order again.',
    avatar: 'AG',
  },
  {
    id: 3,
    name: 'Kavya Nair',
    location: 'Bangalore',
    rating: 5,
    text: 'The Coffee Latte candle is my morning ritual now. It smells exactly like a freshly brewed coffee! Quality is premium and delivery was super fast.',
    avatar: 'KN',
  },
];

const categories = [
  { name: 'Scented', icon: '🌸', href: '/shop?category=scented', desc: 'Aromatic soy candles' },
  { name: 'Matka', icon: '🏺', href: '/shop?category=matka', desc: 'Traditional clay pots' },
  { name: 'Gift Sets', icon: '🎁', href: '/shop?category=gift-set', desc: 'Luxury gift boxes' },
  { name: 'Festive', icon: '✨', href: '/shop?category=festive', desc: 'Special collections' },
];

const features = [
  { icon: <Leaf className="w-6 h-6" />, title: '100% Soy Wax', desc: 'Clean, eco-friendly burning' },
  { icon: <Package className="w-6 h-6" />, title: 'Gift Ready', desc: 'Luxurious packaging always' },
  { icon: <Star className="w-6 h-6" />, title: 'Premium Quality', desc: 'Hand-poured with care' },
  { icon: <Sparkles className="w-6 h-6" />, title: 'Natural Fragrance', desc: 'Essential oils only' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=1400&q=80',
    'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=1400&q=80',
    'https://images.unsplash.com/photo-1612198273689-5e22faefed56?w=1400&q=80',
  ];

  // Auto-cycle hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productAPI.getAll({ featured: 'true', limit: 8 });
        setFeaturedProducts(res.data.products || []);
      } catch {
        // Use fallback if API unavailable
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ========================
          HERO SECTION
          ======================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background slideshow */}
        {heroImages.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentHeroImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={img}
              alt="Rachvi Creation Candles"
              fill
              className="object-cover"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3a2e1e]/70 via-[#3a2e1e]/30 to-transparent" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="text-white animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-6">
              <span className="text-yellow-300 text-sm">✨</span>
              <span className="text-white text-xs font-medium tracking-wider uppercase">
                Handcrafted with Love
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Candles That{' '}
              <span className="italic text-cream-300">Light Up</span>
              <br />
              Your Soul
            </h1>

            <p className="text-cream-200 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Discover our collection of handcrafted soy candles — made with natural
              ingredients, botanical florals, and pure essential oils. Eco-friendly.
              Made in India. Shipped with love. 🕯️
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn-gold px-8 py-3.5">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/919876543210?text=Hi! I want to order from Rachvi Creation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
              >
                💬 Order on WhatsApp
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 flex items-center gap-8">
              {[
                { value: '500+', label: 'Happy Customers' },
                { value: '50+', label: 'Unique Scents' },
                { value: '4.9★', label: 'Avg Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-cream-100">{stat.value}</p>
                  <p className="text-cream-300 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image Indicators */}
          <div className="hidden lg:flex flex-col items-end gap-3">
            <div className="flex gap-2">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroImage(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentHeroImage
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================
          FEATURES STRIP
          ======================== */}
      <section className="bg-mocha-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 text-cream-200">
                <div className="text-cream-300 shrink-0">{f.icon}</div>
                <div>
                  <p className="font-semibold text-sm text-cream-100">{f.title}</p>
                  <p className="text-xs text-mocha-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          CATEGORIES
          ======================== */}
      <section className="py-16 px-4 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-mocha-400 text-sm tracking-widest uppercase font-medium mb-2">
              Browse By Category
            </p>
            <h2 className="section-title">Find Your Perfect Candle</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden rounded-3xl bg-white border border-cream-200 p-6 text-center hover:border-mocha-300 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <h3 className="font-display text-[#3a2e1e] font-semibold text-lg mb-1">
                  {cat.name}
                </h3>
                <p className="text-mocha-400 text-xs">{cat.desc}</p>
                <div className="mt-3 flex items-center justify-center gap-1 text-mocha-500 text-xs font-medium group-hover:gap-2 transition-all">
                  Shop <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          FEATURED PRODUCTS
          ======================== */}
      <section className="py-16 px-4 bg-cream-pattern bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-mocha-400 text-sm tracking-widest uppercase font-medium mb-2">
                ✨ Bestsellers
              </p>
              <h2 className="section-title">Featured Collection</h2>
              <p className="section-subtitle mt-2 max-w-lg">
                Our most-loved handcrafted candles — each one poured with intention.
              </p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-mocha-600 font-medium text-sm hover:text-mocha-800 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                    <div className="skeleton h-6 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            /* Fallback showcase when API unavailable */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  _id: '1', name: 'Lavender Bliss', price: 549, originalPrice: 699,
                  slug: 'lavender-bliss-soy-candle', category: 'scented', fragrance: 'lavender',
                  rating: 4.8, numReviews: 124, isFeatured: true, stock: 50,
                  images: [{ url: 'https://images.unsplash.com/photo-1612198273689-5e22faefed56?w=600', alt: 'Lavender' }],
                  description: '', isActive: true, tags: [], reviews: [], createdAt: '',
                },
                {
                  _id: '2', name: 'Coffee Latte', price: 599, originalPrice: 799,
                  slug: 'coffee-latte-candle', category: 'jar', fragrance: 'coffee',
                  rating: 4.9, numReviews: 89, isFeatured: true, stock: 35,
                  images: [{ url: 'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600', alt: 'Coffee' }],
                  description: '', isActive: true, tags: [], reviews: [], createdAt: '',
                },
                {
                  _id: '3', name: 'Rose Matka Candle', price: 649, originalPrice: 849,
                  slug: 'rose-matka-candle', category: 'matka', fragrance: 'rose',
                  rating: 4.9, numReviews: 67, isFeatured: true, stock: 20,
                  images: [{ url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600', alt: 'Matka' }],
                  description: '', isActive: true, tags: [], reviews: [], createdAt: '',
                },
                {
                  _id: '4', name: 'Festive Gift Set', price: 1299, originalPrice: 1699,
                  slug: 'festive-gift-set-trio', category: 'gift-set', fragrance: 'mixed',
                  rating: 5.0, numReviews: 43, isFeatured: true, stock: 25,
                  images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', alt: 'Gift Set' }],
                  description: '', isActive: true, tags: [], reviews: [], createdAt: '',
                },
              ].map((product) => (
                <ProductCard key={product._id} product={product as Product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/shop" className="btn-secondary">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================
          BRAND STORY / ABOUT STRIP
          ======================== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <Image
                src="https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400&q=80"
                alt="Matka Candle"
                width={300}
                height={350}
                className="rounded-3xl object-cover w-full h-64 shadow-card"
              />
              <Image
                src="https://images.unsplash.com/photo-1612198273689-5e22faefed56?w=400&q=80"
                alt="Lavender Candle"
                width={300}
                height={350}
                className="rounded-3xl object-cover w-full h-64 mt-6 shadow-card"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-mocha-700 text-white rounded-2xl px-6 py-3 shadow-lg whitespace-nowrap">
              <p className="text-sm font-medium">🕯️ 500+ Happy Customers</p>
            </div>
          </div>

          <div>
            <p className="text-mocha-400 text-sm tracking-widest uppercase font-medium mb-3">
              Our Story
            </p>
            <h2 className="section-title mb-4">
              Made with Love,<br />
              <span className="italic text-mocha-500">Lit with Purpose</span>
            </h2>
            <p className="text-mocha-600 leading-relaxed mb-4">
              Rachvi Creation began as a passion project — a dream to fill homes with 
              warmth, fragrance, and handcrafted beauty. Every candle is poured with 
              intention, using 100% natural soy wax, cotton wicks, and pure essential oils.
            </p>
            <p className="text-mocha-600 leading-relaxed mb-6">
              From matka candles that celebrate India&apos;s heritage to elegant jar candles 
              inspired by global trends — we create each piece as a labor of love. 
              Eco-friendly. Cruelty-free. Beautifully packaged. 🌿
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {['🌿 Eco-Friendly', '🐰 Cruelty-Free', '🇮🇳 Made in India', '♻️ Recyclable Packaging'].map((tag) => (
                <span key={tag} className="px-4 py-1.5 bg-cream-100 text-mocha-600 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <Link href="/shop" className="btn-primary">
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================
          TESTIMONIALS
          ======================== */}
      <section className="py-16 px-4 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-mocha-400 text-sm tracking-widest uppercase font-medium mb-2">
              Customer Love
            </p>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-mocha-600 leading-relaxed text-sm mb-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mocha-200 rounded-full flex items-center justify-center">
                    <span className="text-mocha-700 font-bold text-sm">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#3a2e1e] text-sm">{t.name}</p>
                    <p className="text-mocha-400 text-xs">{t.location} • Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          CTA SECTION
          ======================== */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80"
            alt="Gift Candles"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#3a2e1e]/75" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-cream-300 text-sm tracking-widest uppercase font-medium mb-3">
            Perfect Gift Idea 🎁
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Share the Gift of Light
          </h2>
          <p className="text-cream-200 leading-relaxed mb-8">
            Our gift sets are the perfect present for birthdays, anniversaries, Diwali,
            and every special occasion. Beautifully packaged with a personalized card.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop?category=gift-set" className="btn-gold px-8 py-3.5">
              Shop Gift Sets <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/919876543210?text=Hi! I want to order a gift set from Rachvi Creation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/15 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/25 transition-colors"
            >
              💬 Custom Order on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
