'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-cream-100">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]?.url || '/placeholder-candle.jpg'}
            alt={product.images[0]?.alt || product.name}
            fill
            className="product-card-image"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="badge-bestseller text-[10px]">✨ Bestseller</span>
          )}
          {discount > 0 && (
            <span className="badge-sale">{discount}% Off</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-red-100 text-red-600 text-[10px]">Out of Stock</span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="badge bg-orange-100 text-orange-600 text-[10px]">Only {product.stock} left!</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product._id)}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
            inWishlist
              ? 'bg-blush-400 text-white scale-110'
              : 'bg-white/80 backdrop-blur-sm text-mocha-400 hover:bg-white hover:text-blush-400'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-mocha-400 text-xs font-medium uppercase tracking-wider mb-1 capitalize">
          {product.category.replace('-', ' ')} • {product.fragrance}
        </p>

        {/* Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-[#3a2e1e] font-semibold text-base leading-tight hover:text-mocha-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(product.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-cream-300'
                }`}
              />
            ))}
          </div>
          <span className="text-mocha-400 text-xs">
            {product.rating.toFixed(1)} ({product.numReviews})
          </span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-bold text-[#3a2e1e] text-lg">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-mocha-400 text-sm line-through ml-1.5">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              product.stock === 0
                ? 'bg-cream-200 text-cream-400 cursor-not-allowed'
                : inCart
                ? 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200'
                : 'bg-mocha-700 text-white hover:bg-mocha-800 active:scale-95 shadow-sm hover:shadow-md'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Sold Out' : inCart ? 'In Cart' : 'Add'}
          </button>
        </div>

        {/* WhatsApp quick order */}
        {product.stock > 0 && (
          <a
            href={`https://wa.me/919876543210?text=Hi! I'd like to order: ${product.name} (₹${product.price})`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-medium hover:bg-green-100 transition-colors border border-green-200"
          >
            💬 Order on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
