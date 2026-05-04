// Types for the entire Rachvi Creation application

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  images: { url: string; alt: string; public_id?: string }[];
  category: 'scented' | 'festive' | 'jar' | 'matka' | 'decorative' | 'gift-set';
  fragrance: string;
  weight?: string;
  burnTime?: string;
  material?: string;
  tags?: string[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  reviews: Review[];
  rating: number;
  numReviews: number;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  addresses?: Address[];
  wishlist?: string[];
}

export interface Address {
  _id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: User | string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'razorpay' | 'cod';
  paymentResult?: PaymentResult;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveredAt?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface PaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  status: string;
  paid_at: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  products?: T[];
  orders?: T[];
  users?: T[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  total?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
  product?: Product;
  order?: Order;
  products?: Product[];
  orders?: Order[];
}

// Filter types for product shop
export interface ProductFilters {
  search?: string;
  category?: string;
  fragrance?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}
