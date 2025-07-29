import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface OrderItem {
  product: {
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  size: string;
}

interface Order {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          user?.isAdmin ? '/api/orders' : '/api/orders/myorders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [user, token, navigate]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">You have no orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-700">Order ID: {order._id}</p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">${order.total.toFixed(2)}</p>
                  <p
                    className={`text-sm font-medium ${
                      order.status === 'delivered'
                        ? 'text-green-600'
                        : order.status === 'processing'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100 mt-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center py-3">
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} • Size: {item.size}
                      </p>
                    </div>
                    <div className="text-right text-gray-700 font-semibold">
                      ${item.product.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
