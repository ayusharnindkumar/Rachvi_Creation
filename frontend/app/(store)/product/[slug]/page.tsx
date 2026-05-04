'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star, ShoppingBag, Heart, MessageCircle, Minus, Plus,
  Leaf, Clock, Package, ChevronRight, Share2
} from 'lucide-react';
import { productAPI } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await productAPI.getOne(slug as string);
        setProduct(res.data.product);

        // Fetch related products
        const relRes = await productAPI.getAll({
          category: res.data.product.category,
          limit: 4,
        });
        setRelated(
          (relRes.data.products || []).filter(
            (p: Product) => p._id !== res.data.product._id
          ).slice(0, 4)
        );
      } catch {
        // Product not found
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await productAPI.addReview(product!._id, reviewForm);
      toast.success('Review submitted! 🎉');
      setReviewForm({ rating: 5, comment: '' });
      // Refresh product
      const res = await productAPI.getOne(slug as string);
      setProduct(res.data.product);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product?.name,
        text: product?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="skeleton aspect-square rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 rounded w-3/4" />
              <div className="skeleton h-4 rounded w-1/2" />
              <div className="skeleton h-10 rounded w-1/3" />
              <div className="skeleton h-32 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕯️</div>
          <h2 className="font-display text-2xl font-semibold text-[#3a2e1e] mb-2">
            Product Not Found
          </h2>
          <p className="text-mocha-500 mb-4">This candle might be out of stock or moved.</p>
          <Link href="/shop" className="btn-primary">Browse All Candles</Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1 text-sm text-mocha-400">
            <Link href="/" className="hover:text-mocha-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-mocha-600">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#3a2e1e] capitalize">{product.category.replace('-', ' ')}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-mocha-600 line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ========================
              IMAGES SECTION
              ======================== */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-100 shadow-card mb-4">
              <Image
                src={product.images[selectedImage]?.url || '/placeholder-candle.jpg'}
                alt={product.images[selectedImage]?.alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFeatured && (
                  <span className="badge-bestseller">✨ Bestseller</span>
                )}
                {discount > 0 && (
                  <span className="badge-sale">{discount}% Off</span>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isInWishlist(product._id)
                    ? 'bg-blush-400 text-white'
                    : 'bg-white/80 backdrop-blur-sm text-mocha-400 hover:text-blush-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail images */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-mocha-500 shadow-md' : 'border-cream-200 hover:border-mocha-300'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========================
              PRODUCT INFO
              ======================== */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-mocha-400 text-sm font-medium uppercase tracking-wider mb-2 capitalize">
              {product.category.replace('-', ' ')} • {product.fragrance}
            </p>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#3a2e1e] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-cream-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-mocha-600 text-sm font-medium">
                {product.rating.toFixed(1)}
              </span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-mocha-400 text-sm hover:text-mocha-600 transition-colors"
              >
                ({product.numReviews} reviews)
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-4xl font-bold text-[#3a2e1e]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-mocha-400 text-xl line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="badge-sale text-sm">{discount}% Off</span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-mocha-600 text-base leading-relaxed mb-5">
                {product.shortDescription}
              </p>
            )}

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-cream-100 rounded-2xl p-4">
              {[
                { icon: <Leaf className="w-4 h-4" />, label: 'Material', value: product.material || 'Soy Wax' },
                { icon: <Clock className="w-4 h-4" />, label: 'Burn Time', value: product.burnTime || '40-45 hrs' },
                { icon: <Package className="w-4 h-4" />, label: 'Weight', value: product.weight || '200g' },
                { icon: <Star className="w-4 h-4" />, label: 'Fragrance', value: product.fragrance },
              ].map((detail) => (
                <div key={detail.label} className="flex items-center gap-2">
                  <span className="text-mocha-500">{detail.icon}</span>
                  <div>
                    <p className="text-mocha-400 text-xs">{detail.label}</p>
                    <p className="text-[#3a2e1e] text-sm font-medium capitalize">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stock status */}
            <div className="mb-5">
              {product.stock === 0 ? (
                <span className="text-red-500 font-medium text-sm">❌ Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-orange-500 font-medium text-sm">⚡ Only {product.stock} left!</span>
              ) : (
                <span className="text-green-600 font-medium text-sm">✅ In Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-medium text-[#3a2e1e]">Quantity:</span>
                <div className="flex items-center gap-0 bg-cream-100 rounded-xl overflow-hidden border border-cream-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-cream-200 transition-colors"
                    disabled={quantity === 1}
                  >
                    <Minus className="w-4 h-4 text-mocha-600" />
                  </button>
                  <span className="w-12 text-center font-semibold text-[#3a2e1e]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-cream-200 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4 text-mocha-600" />
                  </button>
                </div>
                <span className="text-mocha-400 text-xs">Max {product.stock}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <a
                href={`https://wa.me/919876543210?text=Hi! I'd like to order: ${product.name} (₹${product.price}) x ${quantity}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors flex-1"
              >
                <MessageCircle className="w-5 h-5" />
                Order on WhatsApp
              </a>
            </div>

            {/* Secondary actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleWishlist(product._id)}
                className="flex items-center gap-1.5 text-sm text-mocha-500 hover:text-blush-500 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-blush-400 text-blush-400' : ''}`} />
                {isInWishlist(product._id) ? 'Saved' : 'Save to Wishlist'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-mocha-500 hover:text-mocha-700 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Shipping info */}
            <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700">
              🚚 <strong>Free shipping</strong> on orders above ₹500. Standard delivery: 3-5 business days.
            </div>
          </div>
        </div>

        {/* ========================
            TABS: Description + Reviews
            ======================== */}
        <div className="mt-14">
          <div className="flex gap-0 border-b border-cream-200">
            {(['description', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-mocha-600 text-mocha-700'
                    : 'border-transparent text-mocha-400 hover:text-mocha-600'
                }`}
              >
                {tab} {tab === 'reviews' && `(${product.numReviews})`}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' ? (
              <div className="max-w-3xl">
                <p className="text-mocha-600 leading-relaxed text-base whitespace-pre-line">
                  {product.description}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-cream-100 text-mocha-600 rounded-full text-sm capitalize">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl space-y-8">
                {/* Review Form */}
                <div className="bg-cream-100 rounded-2xl p-6">
                  <h3 className="font-display text-lg font-semibold text-[#3a2e1e] mb-4">
                    Write a Review
                  </h3>
                  {isAuthenticated ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a2e1e] mb-2">
                          Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-7 h-7 transition-colors ${
                                  star <= reviewForm.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-cream-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a2e1e] mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                          rows={4}
                          placeholder="Share your experience with this candle..."
                          className="input-field resize-none"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="btn-primary disabled:opacity-60"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-mocha-500 text-sm">
                      <Link href="/login" className="text-mocha-700 font-medium underline">
                        Login
                      </Link>{' '}
                      to write a review.
                    </p>
                  )}
                </div>

                {/* Existing Reviews */}
                {product.reviews.length === 0 ? (
                  <p className="text-mocha-400 text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  product.reviews.map((review) => (
                    <div key={review._id} className="border-b border-cream-200 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-mocha-200 rounded-full flex items-center justify-center">
                            <span className="text-mocha-700 font-bold text-sm">
                              {review.name[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#3a2e1e] text-sm">{review.name}</p>
                            <p className="text-mocha-400 text-xs">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'long', day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-cream-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-mocha-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================
            RELATED PRODUCTS
            ======================== */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-[#3a2e1e] mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
