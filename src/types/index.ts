export interface Product {
  _id: string;
  id?: number; // Keep for backward compatibility
  name: string;
  price: number;
  images: string[]; // Array of image URLs
  image?: string; // Single image URL for backward compatibility
  description: string;
  category: string;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  new?: boolean;
  rating?: number;
  stock?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  items: {
    product: Product;
    quantity: number;
    size?: string;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string } | string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}