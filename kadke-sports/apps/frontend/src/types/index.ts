export interface Category {
  id: string; name: string; slug: string;
  description?: string; imageUrl?: string;
}

export interface Product {
  id: string; name: string; slug: string;
  description: string; shortDesc?: string;
  brand: string; sku: string;
  category: Category;
  price: string | number;
  discount: string | number;
  images: string[];
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  inventory?: { stock: number };
}

export interface CartItem {
  id: string; productId: string;
  product: Product;
  quantity: number; size?: string; color?: string;
}

export interface Order {
  id: string; orderNumber: string;
  status: string; paymentStatus: string;
  subtotal: string; discount: string; shipping: string; tax: string; total: string;
  items: any[]; createdAt: string;
}

export interface User {
  id: string; email: string; name: string;
  role: 'USER' | 'ADMIN'; avatarUrl?: string;
}
