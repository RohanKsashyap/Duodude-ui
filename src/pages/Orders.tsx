import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import OrderDetailsModal from '../components/OrderDetailsModal';

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(
          user?.role === 'admin' ? '/api/orders' : '/api/orders/myorders'
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

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      setOrders(orders.map(o => 
        o._id === orderId ? { ...o, status: 'cancelled' } : o
      ));
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const handleReturnOrder = async (orderId: string, returnItems: any[]) => {
    try {
      await api.post('/api/returns', {
        orderId,
        items: returnItems,
        reason: 'Return request from user'
      });
      alert('Return request submitted successfully. Please await admin approval.');
    } catch (error) {
      console.error('Error submitting return request:', error);
      alert('Failed to submit return request');
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

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
                      src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/api/placeholder/64/64'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/64/64';
                      }}
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
              
              {/* Action buttons */}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => openOrderDetails(order)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  View Details
                </button>
                {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        try {
                          await api.put(`/api/orders/${order._id}/cancel`);
                          // Update the order status in the local state
                          setOrders(orders.map(o => 
                            o._id === order._id ? { ...o, status: 'cancelled' } : o
                          ));
                          alert('Order cancelled successfully');
                        } catch (error) {
                          console.error('Error cancelling order:', error);
                          alert('Failed to cancel order');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Cancel Order
                  </button>
                ) : order.status === 'delivered' ? (
                  <button
                    onClick={async () => {
                      const reason = prompt('Please provide a reason for return:');
                      if (reason) {
                        try {
                          const returnItems = order.items.map(item => ({
                            product: item.product._id || item.product.id,
                            quantity: item.quantity,
                            size: item.size,
                            reason: 'Product issue'
                          }));
                          
                          await api.post('/api/returns', {
                            orderId: order._id,
                            items: returnItems,
                            reason: reason
                          });
                          
                          alert('Return request submitted successfully. Please await admin approval.');
                        } catch (error) {
                          console.error('Error submitting return request:', error);
                          alert('Failed to submit return request');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Return Order
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeModal}
        onCancel={handleCancelOrder}
        onReturn={handleReturnOrder}
      />
    </div>
  );
};

export default OrdersPage;
