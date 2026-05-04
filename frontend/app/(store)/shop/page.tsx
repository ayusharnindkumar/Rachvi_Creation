'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productAPI } from '@/lib/api';
import { Product } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All Candles' },
  { value: 'scented', label: 'Scented' },
  { value: 'jar', label: 'Jar Candles' },
  { value: 'matka', label: 'Matka Candles' },
  { value: 'festive', label: 'Festive' },
  { value: 'decorative', label: 'Decorative' },
  { value: 'gift-set', label: 'Gift Sets' },
];

const FRAGRANCES = [
  'All Fragrances', 'lavender', 'rose', 'coffee', 'vanilla', 'sandalwood', 'jasmine', 'mixed',
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: '-numReviews', label: 'Most Reviewed' },
];

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50"><div className="skeleton h-48" /></div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    fragrance: searchParams.get('fragrance') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        sort: filters.sort,
        page: filters.page,
        limit: 12,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.fragrance && filters.fragrance !== 'All Fragrances') params.fragrance = filters.fragrance;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);

      const res = await productAPI.getAll(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotalProducts(res.data.pagination?.total || 0);
    } catch {
      // Fallback demo products when backend unavailable
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      fragrance: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      page: 1,
    });
    router.push('/shop');
  };

  const hasActiveFilters =
    filters.category || filters.fragrance || filters.minPrice || filters.maxPrice || filters.search;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Shop Header */}
      <div className="bg-cream-pattern bg-mocha-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-cream-100 mb-2">
            Our Collection
          </h1>
          <p className="text-mocha-300">
            {totalProducts > 0 ? `${totalProducts} handcrafted candles` : 'Handcrafted candles'}
            {filters.search && ` matching "${filters.search}"`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* Left: Filter toggle + active filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsFilterOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-cream-300 rounded-xl text-sm font-medium text-[#3a2e1e] hover:border-mocha-400 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-mocha-600 rounded-full" />
              )}
            </button>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => updateFilter('category', cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.category === cat.value
                      ? 'bg-mocha-700 text-white'
                      : 'bg-white border border-cream-300 text-mocha-600 hover:border-mocha-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Right: Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-cream-300 rounded-xl text-sm text-[#3a2e1e] focus:border-mocha-400 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha-400 pointer-events-none" />
          </div>
        </div>

        {/* Expanded Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white rounded-2xl border border-cream-200 p-6 mb-6 shadow-card">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Fragrance Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#3a2e1e] mb-2">Fragrance</label>
                <select
                  value={filters.fragrance}
                  onChange={(e) => updateFilter('fragrance', e.target.value)}
                  className="input-field"
                >
                  {FRAGRANCES.map((f) => (
                    <option key={f} value={f === 'All Fragrances' ? '' : f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-semibold text-[#3a2e1e] mb-2">Min Price (₹)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="e.g. 200"
                  className="input-field"
                  min={0}
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-semibold text-[#3a2e1e] mb-2">Max Price (₹)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="e.g. 1500"
                  className="input-field"
                  min={0}
                />
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-[#3a2e1e] mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="candle name, scent..."
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={clearFilters} className="btn-outline text-sm px-4 py-2">
                Clear All
              </button>
              <button onClick={() => setIsFilterOpen(false)} className="btn-primary text-sm px-4 py-2">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden bg-white">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="skeleton h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🕯️</div>
            <h3 className="font-display text-xl font-semibold text-[#3a2e1e] mb-2">
              No candles found
            </h3>
            <p className="text-mocha-500 mb-4">
              {filters.search
                ? `No results for "${filters.search}"`
                : 'Try adjusting your filters'}
            </p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateFilter('page', i + 1)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                      filters.page === i + 1
                        ? 'bg-mocha-700 text-white'
                        : 'bg-white border border-cream-300 text-mocha-600 hover:border-mocha-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
