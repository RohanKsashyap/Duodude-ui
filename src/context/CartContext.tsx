import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext'; // You must have this
import axios from 'axios';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
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
      if (isAuthenticated) {
        try {
          const res = await axios.get('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartItems(
            res.data.items.map((item: any) => ({
              product: item.product,
              quantity: item.quantity,
              size: item.size,
            }))
          );
        } catch (err) {
          console.error('Error loading cart from DB:', err);
        }
      } else {
        const local = localStorage.getItem('cart');
        setCartItems(local ? JSON.parse(local) : []);
      }
    };
    loadCart();
  }, [isAuthenticated]);

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
        await axios.post(
          '/api/cart/add',
          {
            productId: item.product._id || item.product.id,
            quantity: item.quantity,
            size: item.size,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
        await axios.post(
          '/api/cart/add',
          {
            productId: product._id || product.id,
            quantity,
            size,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Refresh cart
        const res = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
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
          item => item.product.id === product.id && item.size === size
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

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    if (isAuthenticated) {
      try {
        await axios.delete('/api/cart/clear', {
          headers: { Authorization: `Bearer ${token}` },
        });
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
