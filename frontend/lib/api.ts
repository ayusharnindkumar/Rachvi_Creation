import axios from 'axios';

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Request interceptor - attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rc_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rc_token');
        localStorage.removeItem('rc_user');
        // Only redirect if not already on auth page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ==============================
// Auth API Calls
// ==============================
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: { name: string; phone?: string }) =>
    api.put('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),

  addAddress: (data: object) => api.post('/auth/address', data),

  toggleWishlist: (productId: string) =>
    api.post(`/auth/wishlist/${productId}`),
};

// ==============================
// Product API Calls
// ==============================
export const productAPI = {
  getAll: (params?: object) => api.get('/products', { params }),

  getOne: (slugOrId: string) => api.get(`/products/${slugOrId}`),

  create: (formData: FormData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => api.delete(`/products/${id}`),

  addReview: (id: string, data: { rating: number; comment: string }) =>
    api.post(`/products/${id}/reviews`, data),
};

// ==============================
// Order API Calls
// ==============================
export const orderAPI = {
  create: (data: object) => api.post('/orders', data),

  createRazorpay: (amount: number) => api.post('/orders/razorpay', { amount }),

  verifyPayment: (orderId: string, data: object) =>
    api.post(`/orders/${orderId}/pay`, data),

  getMyOrders: () => api.get('/orders/my'),

  getOne: (id: string) => api.get(`/orders/${id}`),

  // Admin
  getAll: (params?: object) => api.get('/orders', { params }),

  updateStatus: (id: string, data: { status: string; trackingNumber?: string }) =>
    api.put(`/orders/${id}/status`, data),
};

// ==============================
// Admin API Calls
// ==============================
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),

  getUsers: (params?: object) => api.get('/admin/users', { params }),

  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
};
