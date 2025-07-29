import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users, ShoppingBag, TrendingUp, Eye, Edit, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || !user?.isAdmin) {
        return navigate('/');
      }

      try {
        const [ordersRes, usersRes] = await Promise.all([
          axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user, navigate]);

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your store, orders, and users</p>
        </div>

        {/* Nav Tabs */}
        <div className="border-b mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'orders', name: 'Orders', icon: ShoppingBag },
              { id: 'users', name: 'Users', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={TrendingUp} bg="green" />
              <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} bg="blue" />
              <StatCard label="Total Users" value={users.length} icon={Users} bg="purple" />
            </div>

            <RecentOrdersTable orders={orders.slice(0, 5)} formatDate={formatDate} getStatusColor={getStatusColor} />
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrderTable orders={orders} formatDate={formatDate} getStatusColor={getStatusColor} />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersTable users={users} formatDate={formatDate} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
