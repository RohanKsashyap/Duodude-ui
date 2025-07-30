import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext'; // You must have this
import api from '../config/axios';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  syncLocalToDB: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 🔁 Load cart from server or localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && token) {
        try {
          console.log('Loading cart from server for authenticated user...');
          const res = await api.get('/api/cart');
          if (Array.isArray(res.data.items)) {
            setCartItems(
              res.data.items.map((item: any) => ({
                product: item.product,
                quantity: item.quantity,
                size: item.size,
              }))
            );
          } else {
            setCartItems([]);
          }
        } catch (err: any) {
          console.error('Error loading cart from DB:', err);
          
          // If authentication fails, fall back to local storage
          if (err.response?.status === 401) {
            console.log('Authentication failed, falling back to local storage');
            const local = localStorage.getItem('cart');
            setCartItems(local ? JSON.parse(local) : []);
          } else {
            console.error('Cart fetch error:', new Error('Failed to load cart'));
          }
        }
      } else {
        console.log('Loading cart from local storage...');
        const local = localStorage.getItem('cart');
        setCartItems(local ? JSON.parse(local) : []);
      }
    };
    loadCart();
  }, [isAuthenticated, token]);

  // 🔁 Persist to localStorage (only for guest)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // ✅ Sync guest cart to DB after login
  const syncLocalToDB = async () => {
    const local = localStorage.getItem('cart');
    const localItems: CartItem[] = local ? JSON.parse(local) : [];
    if (localItems.length === 0) return;

    try {
      for (const item of localItems) {
        await api.post('/api/cart/add', {
          productId: item.product._id || item.product.id,
          quantity: item.quantity,
          size: item.size,
        });
      }
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Error syncing cart to DB:', err);
    }
  };

  const addToCart = async (product: Product, quantity: number, size?: string) => {
    const newItem: CartItem = { product, quantity, size };

    // 🧠 For logged in users, sync to backend
    if (isAuthenticated) {
      try {
        await api.post('/api/cart/add', {
          productId: product._id || product.id,
          quantity,
          size,
        });
        // Refresh cart
        const res = await api.get('/api/cart');
        setCartItems(
          res.data.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            size: item.size,
          }))
        );
      } catch (err) {
        console.error('Error adding to cart in DB:', err);
      }
    } else {
      // Guest cart (local)
      setCartItems(prev => {
        const index = prev.findIndex(
          item => (item.product._id || item.product.id) === (product._id || product.id) && item.size === size
        );
        if (index > -1) {
          const updated = [...prev];
          updated[index].quantity += quantity;
          return updated;
        }
        return [...prev, newItem];
      });
    }
  };

  const removeFromCart = (productId: string | number) => {
    setCartItems(prev => prev.filter(item => (item.product._id || item.product.id) !== productId));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        (item.product._id || item.product.id) === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    if (isAuthenticated) {
      try {
        await api.delete('/api/cart/clear');
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    } else {
      localStorage.removeItem('cart');
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, syncLocalToDB }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
