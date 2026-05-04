import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Mail, Phone, Heart } from 'lucide-react';

// Instagram SVG icon (not in all lucide-react versions)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-cream-200 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#3a2e1e] text-cream-200">
      {/* Newsletter Section */}
      <div className="bg-mocha-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mocha-300 text-sm tracking-widest uppercase font-medium mb-2">
            Stay Connected
          </p>
          <h3 className="font-display text-2xl md:text-3xl text-cream-100 mb-3">
            Join Our Candle Community 🕯️
          </h3>
          <p className="text-cream-300 text-sm mb-6 max-w-md mx-auto">
            Get exclusive offers, new arrivals, and candle care tips delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-full bg-mocha-700 border border-mocha-600 text-cream-100 placeholder-mocha-400 outline-none focus:border-cream-400 text-sm"
            />
            <button type="submit" className="btn-gold px-6 py-3 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-mocha-500 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Rachvi Creation"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-display text-cream-100 text-lg font-semibold leading-tight">
                  Rachvi Creation
                </p>
                <p className="text-mocha-400 text-xs tracking-widest uppercase">
                  Handcrafted Candles
                </p>
              </div>
            </Link>
            <p className="text-cream-400 text-sm leading-relaxed mb-4">
              Handcrafted with love, our candles bring warmth, fragrance, and 
              a touch of luxury to every space. Eco-friendly. Made in India. 🇮🇳
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/rachvicreation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-mocha-700 rounded-full flex items-center justify-center hover:bg-blush-500 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi! I'm interested in your candles"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-mocha-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-cream-200" />
              </a>
              <a
                href="mailto:hello@rachvicreation.com"
                className="w-9 h-9 bg-mocha-700 rounded-full flex items-center justify-center hover:bg-mocha-500 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-cream-200" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-cream-100 text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/shop', label: 'All Candles' },
                { href: '/shop?category=scented', label: 'Scented Candles' },
                { href: '/shop?category=matka', label: 'Matka Candles' },
                { href: '/shop?category=gift-set', label: 'Gift Sets' },
                { href: '/shop?category=festive', label: 'Festive Collection' },
                { href: '/shop?featured=true', label: 'Bestsellers' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream-400 text-sm hover:text-cream-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display text-cream-100 text-lg font-semibold mb-4">Help</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/profile?tab=orders', label: 'Track Order' },
                { href: '#', label: 'Return Policy' },
                { href: '#', label: 'Shipping Info' },
                { href: '#', label: 'Care Instructions' },
                { href: '#', label: 'FAQ' },
                { href: '#', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-cream-400 text-sm hover:text-cream-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-cream-100 text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-cream-400 hover:text-cream-100 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                +91 98765 43210
              </a>
              <a
                href="mailto:hello@rachvicreation.com"
                className="flex items-center gap-3 text-sm text-cream-400 hover:text-cream-100 transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                hello@rachvicreation.com
              </a>
              <a
                href="https://instagram.com/rachvicreation"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-cream-400 hover:text-cream-100 transition-colors"
              >
                <InstagramIcon />
                @rachvicreation
              </a>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919876543210?text=Hi! I'd like to order from Rachvi Creation"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors whatsapp-pulse"
            >
              <MessageCircle className="w-4 h-4" />
              Order on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-mocha-700 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-cream-500 text-xs text-center md:text-left">
            © {currentYear} Rachvi Creation. All rights reserved. Made with{' '}
            <Heart className="inline w-3 h-3 text-blush-400" /> in India.
          </p>
          <div className="flex items-center gap-4 text-xs text-cream-500">
            <Link href="#" className="hover:text-cream-200 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-cream-200 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
