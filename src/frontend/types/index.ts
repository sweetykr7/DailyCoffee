export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductOption {
  id: string;
  type: 'WEIGHT' | 'GRIND';
  value: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  options?: ProductOption[];
  reviews?: Review[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2?: string;
  };
  totalAmount: number;
  couponDiscount: number;
  pointDiscount: number;
  paymentMethod?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user?: { id: string; name: string };
  productId: string;
  product?: { id: string; name: string };
  rating: number;
  content: string;
  images: string[];
  likes: number;
  orderId?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
