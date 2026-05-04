'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Upload, X, Save, Star } from 'lucide-react';
import { productAPI } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['scented', 'festive', 'jar', 'matka', 'decorative', 'gift-set'];
const FRAGRANCES = ['lavender', 'rose', 'coffee', 'vanilla', 'sandalwood', 'jasmine', 'mixed', 'other'];

const defaultForm = {
  name: '', description: '', shortDescription: '', price: '',
  originalPrice: '', category: 'scented', fragrance: 'lavender',
  weight: '', burnTime: '', material: 'Soy Wax', stock: '',
  isFeatured: false, tags: '',
};

export default function AdminProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
    else fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productAPI.getAll({ limit: 50 });
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: String(product.price),
      originalPrice: String(product.originalPrice || ''),
      category: product.category,
      fragrance: product.fragrance,
      weight: product.weight || '',
      burnTime: product.burnTime || '',
      material: product.material || 'Soy Wax',
      stock: String(product.stock),
      isFeatured: product.isFeatured,
      tags: product.tags?.join(', ') || '',
    });
    setImageFiles([]);
    setImagePreviews(product.images.map((img) => img.url));
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'tags') {
          // Split tags by comma
          const tagsArr = (val as string).split(',').map((t) => t.trim()).filter(Boolean);
          tagsArr.forEach((tag) => formData.append('tags[]', tag));
        } else {
          formData.append(key, String(val));
        }
      });
      imageFiles.forEach((file) => formData.append('images', file));

      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        toast.success('Product updated!');
      } else {
        await productAPI.create(formData);
        toast.success('Product created!');
      }

      setShowForm(false);
      fetchProducts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await productAPI.delete(product._id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Admin Nav */}
      <div className="bg-[#3a2e1e] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-cream-300 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="font-display text-xl font-bold">Product Management</h1>
        </div>
        <button onClick={openNewForm} className="btn-gold text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream-50 border-b border-cream-200">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Featured', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-mocha-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                            {product.images[0] && (
                              <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3a2e1e] line-clamp-1">{product.name}</p>
                            <p className="text-xs text-mocha-400 capitalize">{product.fragrance}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs capitalize bg-cream-100 text-mocha-600 px-2 py-1 rounded-full">
                          {product.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#3a2e1e]">
                        ₹{product.price.toLocaleString('en-IN')}
                        {product.originalPrice && (
                          <span className="text-xs text-mocha-400 line-through ml-1">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.stock === 0 ? 'bg-red-100 text-red-600' :
                          product.stock <= 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {product.stock} left
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-mocha-400">({product.numReviews})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.isFeatured ? 'bg-gold-400 text-white' : 'bg-cream-100 text-mocha-400'
                        }`}>
                          {product.isFeatured ? '✨ Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-1.5 text-mocha-500 hover:text-mocha-700 hover:bg-cream-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-mocha-400">No products found</p>
                  <button onClick={openNewForm} className="btn-primary mt-3">
                    <Plus className="w-4 h-4" /> Add First Product
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-display text-xl font-semibold text-[#3a2e1e]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-full">
                <X className="w-5 h-5 text-mocha-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#3a2e1e] mb-2">
                  Product Images
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-cream-300 rounded-2xl p-6 text-center cursor-pointer hover:border-mocha-400 transition-colors"
                >
                  <Upload className="w-8 h-8 text-mocha-400 mx-auto mb-2" />
                  <p className="text-sm text-mocha-500">Click to upload images (max 5)</p>
                  <p className="text-xs text-mocha-400 mt-1">JPG, PNG, WebP up to 5MB each</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                        <Image src={preview} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. Lavender Bliss Soy Candle"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="input-field"
                    required
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace('-', ' ').charAt(0).toUpperCase() + c.replace('-', ' ').slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Fragrance *</label>
                  <select
                    value={form.fragrance}
                    onChange={(e) => setForm((f) => ({ ...f, fragrance: e.target.value }))}
                    className="input-field"
                    required
                  >
                    {FRAGRANCES.map((f) => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="input-field"
                    placeholder="499"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Original Price (₹)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    className="input-field"
                    placeholder="699 (for discount display)"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="input-field"
                    placeholder="50"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Weight</label>
                  <input
                    type="text"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    className="input-field"
                    placeholder="200g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Burn Time</label>
                  <input
                    type="text"
                    value={form.burnTime}
                    onChange={(e) => setForm((f) => ({ ...f, burnTime: e.target.value }))}
                    className="input-field"
                    placeholder="40-45 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Material</label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                    className="input-field"
                    placeholder="Soy Wax"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    className="input-field"
                    placeholder="aromatherapy, gift, eco-friendly"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Short Description</label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                    className="input-field"
                    placeholder="One-line description for product cards"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#3a2e1e] mb-1.5">Full Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="Detailed product description..."
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                      className="w-4 h-4 accent-mocha-600"
                    />
                    <span className="text-sm font-medium text-[#3a2e1e]">
                      ✨ Mark as Featured (shows in homepage bestsellers)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center disabled:opacity-70">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
