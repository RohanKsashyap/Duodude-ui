import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { baseurl } from './ProductsPage';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart data from the backend
  const fetchCart = () => {
    setLoading(true);
    setError(null);

    // Fetch cart data from the backend API
    fetch(`${baseurl}/api/cart`, {
      credentials: 'include', // important if you're using cookies for authentication
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cart');
        return res.json();
      })
      .then((data: { items: CartItem[] }) => {
        setCartItems(data.items); // Update the cart items state
      })
      .catch((err) => {
        console.error('Cart fetch error:', err);
        setError(err.message); // Set error state in case of failure
      })
      .finally(() => setLoading(false)); // Stop loading state
  };

  // Run fetchCart once the component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  // Update item quantity in the cart
  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) return;

    fetch(`/api/cart/${productId}/quantity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update quantity');
        return res.json();
      })
      .then(fetchCart) // Re-fetch cart after successful update
      .catch((err) => setError(err.message)); // Handle error
  };

  // Remove an item from the cart
  const removeFromCart = (productId: string) => {
    fetch(`/api/cart/${productId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to remove item');
        return res.json();
      })
      .then(fetchCart) // Re-fetch cart after successful removal
      .catch((err) => setError(err.message)); // Handle error
  };

  // Clear the entire cart
  const clearCart = () => {
    fetch('/api/cart', { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to clear cart');
        return res.json();
      })
      .then(fetchCart) // Re-fetch cart after clearing
      .catch((err) => setError(err.message)); // Handle error
  };

  // Calculate the total price (with tax and shipping)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping if over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax; // Total price

  // Display loading or error states
  if (loading) return <div className="text-center py-12">Loading cart…</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;

  // If the cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex flex-col items-center justify-center">
          <ShoppingBag size={64} className="text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
          <Link to="/products" className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          <div className="lg:col-span-7">
            <ul role="list" className="border-t border-b divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={`${item.product._id}-${item.size ?? ''}`} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-md sm:w-32 sm:h-32"
                    />
                  </div>
                  <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                    <div>
                      <div className="flex justify-between">
                        <h4 className="text-sm">
                          <Link
                            to={`/products/${item.product._id}`}
                            className="font-medium text-gray-700 hover:text-gray-800"
                          >
                            {item.product.name}
                          </Link>
                        </h4>
                        <p className="ml-4 text-sm font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      {item.product.colors && (
                        <p className="mt-1 text-sm text-gray-500">{item.product.colors.split(',')[0]}</p>
                      )}
                      {item.size && (
                        <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                      )}
                    </div>
                    <div className="mt-4 flex-1 flex items-end justify-between">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-2 text-gray-500 hover:text-gray-600"
                        >
                          {/* minus icon */}
                          <span className="sr-only">Decrease quantity</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 12H4"></path>
                          </svg>
                        </button>
                        <span className="px-4 text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-2 text-gray-500 hover:text-gray-600"
                        >
                          {/* plus icon */}
                          <span className="sr-only">Increase quantity</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 4v16m8-8H4"></path>
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between">
              <Link to="/products" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                <ArrowLeft size={16} className="mr-2" />
                Continue Shopping
              </Link>
              <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-800">
                Clear Cart
              </button>
            </div>
          </div>
          <div className="mt-16 lg:mt-0 lg:col-span-5">
            <div className="bg-gray-50 rounded-lg px-6 py-8">
              <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
              <div className="mt-8 space-y-4">
                {[['Subtotal', subtotal], ['Shipping', shipping], ['Tax', tax]].map(([label, amt]) => (
                  <div key={label as string} className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {label === 'Shipping' && shipping === 0 ? 'Free' : `$${(amt as number).toFixed(2)}`}
                    </p>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <p className="text-base font-medium text-gray-900">Order total</p>
                  <p className="text-base font-medium text-gray-900">${total.toFixed(2)}</p>
                </div>
              </div>
              <button type="button" className="mt-8 w-full bg-black text-white rounded-md py-3 hover:bg-gray-800">
                Checkout
              </button>
              <p className="mt-4 text-center text-sm text-gray-500">Free shipping on orders over $100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
