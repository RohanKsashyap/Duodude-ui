import React, { useState } from 'react';
import { Eye, Edit2, Trash2, Check, X, ChevronDown } from 'lucide-react';
import api from '../../config/axios';
import OrderDetailsModal from '../../components/OrderDetailsModal';
import { formatINR } from '../../utils/currency';
import { toast } from 'react-toastify';

interface AdminOrdersTabProps {
  orders: any[];
  setOrders: (o: any[]) => void;
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-gray-900 text-white';
    case 'shipped': return 'bg-gray-700 text-white';
    case 'processing': return 'bg-gray-200 text-gray-900';
    case 'cancelled': return 'bg-gray-100 text-gray-400';
    case 'pending': return 'bg-white text-gray-700 border border-gray-300';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ orders, setOrders }) => {
  const [editingId, setEditingId] = useState<string>('');
  const [editStatus, setEditStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsModalOpen(true);
    } catch {
      const order = orders.find((o) => o._id === orderId);
      if (order) { setSelectedOrder(order); setIsModalOpen(true); }
    }
  };

  const handleEdit = (order: any) => {
    setEditingId(order._id);
    setEditStatus(order.status);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/api/orders/${editingId}/status`, { status: editStatus });
      setOrders(orders.map((o) => (o._id === editingId ? { ...o, status: editStatus } : o)));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order status');
    }
    setEditingId('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/api/orders/${id}`);
      setOrders(orders.filter((o) => o._id !== id));
      toast.success('Order deleted');
    } catch {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewOrder(order._id)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-500">#{order._id?.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatINR(order.total ?? 0)}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {editingId === order._id ? (
                      <div className="relative inline-flex items-center gap-2">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black appearance-none pr-8"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
                        <button onClick={handleEditSave} className="p-1.5 bg-black text-white rounded-lg hover:bg-gray-800">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId('')} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(order)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit status"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
      />
    </div>
  );
};

export default AdminOrdersTab;
