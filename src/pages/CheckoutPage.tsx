import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Edit2, Plus, MapPin } from 'lucide-react';
import api from '../config/axios';
import { baseurl } from './ProductsPage';

interface Address {
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

const CheckoutPage: React.FC = () => {
  const { user, token } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [address, setAddress] = useState<Address>({ name: '', street: '', city: '', zip: '', country: '' });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const defaultAddress = res.data.addresses.find((address: any) => address.isDefault);
        setAddress(defaultAddress || address);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseurl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product: item.product._id || item.product.id,
            quantity: item.quantity,
            size: item.size,
          })),
          total,
          shippingAddress: address,
          paymentMethod: 'cod',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to place order');
      }
      setSuccess('Order placed successfully!');
      clearCart();
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <div className="space-y-2">
            <input name="name" value={address.name} onChange={handleChange} placeholder="Full Name" className="w-full border px-3 py-2 rounded" />
            <input name="street" value={address.street} onChange={handleChange} placeholder="Street Address" className="w-full border px-3 py-2 rounded" />
            <input name="city" value={address.city} onChange={handleChange} placeholder="City" className="w-full border px-3 py-2 rounded" />
            <input name="zip" value={address.zip} onChange={handleChange} placeholder="ZIP Code" className="w-full border px-3 py-2 rounded" />
            <input name="country" value={address.country} onChange={handleChange} placeholder="Country" className="w-full border px-3 py-2 rounded" />
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <ul className="mb-2">
            {cartItems.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="flex justify-between text-sm"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
        <button
          className="w-full bg-black text-white py-3 rounded font-semibold"
          onClick={handlePlaceOrder}
          disabled={loading || !address.name || !address.street || !address.city || !address.zip || !address.country}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage; 