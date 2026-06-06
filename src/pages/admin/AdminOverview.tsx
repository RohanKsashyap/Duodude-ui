import React from 'react';
import { TrendingUp, ShoppingBag, Users, Package, RefreshCw, Plus, Eye } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { useNavigate } from 'react-router-dom';

interface OverviewProps {
  orders: any[];
  users: any[];
  products: any[];
  analytics: any;
  onTabChange: (tab: string) => void;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
}> = ({ icon, label, value, badge, badgeColor }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="p-2 bg-black rounded-lg text-white">{icon}</div>
      {badge && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            badgeColor || 'bg-gray-100 text-gray-600'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-gray-900 text-white';
    case 'shipped': return 'bg-gray-700 text-white';
    case 'processing': return 'bg-gray-300 text-gray-900';
    case 'cancelled': return 'bg-gray-100 text-gray-500 line-through';
    case 'pending': return 'bg-white text-gray-700 border border-gray-300';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const AdminOverview: React.FC<OverviewProps> = ({ orders, users, products, analytics, onTabChange }) => {
  const totalRevenue = Array.isArray(orders)
    ? orders.reduce((acc, o) => acc + (o.total || 0), 0)
    : 0;

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 6) : [];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Total Revenue"
          value={formatINR(analytics?.totalSales ?? totalRevenue)}
          badge="+12.5%"
          badgeColor="bg-green-100 text-green-700"
        />
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Total Orders"
          value={analytics?.totalOrders ?? (Array.isArray(orders) ? orders.length : 0)}
          badge="+8.2%"
          badgeColor="bg-green-100 text-green-700"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Total Customers"
          value={analytics?.totalUsers ?? users.length}
          badge="+15.3%"
          badgeColor="bg-green-100 text-green-700"
        />
        <StatCard
          icon={<Package size={18} />}
          label="Total Products"
          value={Array.isArray(products) ? products.length : 0}
          badge="Active"
          badgeColor="bg-black text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
              <p className="text-xs uppercase tracking-widest text-gray-400 mt-0.5">Real-time store updates</p>
            </div>
            <button
              onClick={() => onTabChange('orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View all orders"
            >
              <RefreshCw size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">No recent orders</div>
            ) : (
              recentOrders.map((order) => {
                const initials = order.user?.name
                  ? order.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'NA';
                return (
                  <div key={order._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {order.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        ORDER {order._id?.slice(-12).toUpperCase()}
                      </p>
                    </div>
                    {/* Amount + Status */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatINR(order.total ?? 0)}</p>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {recentOrders.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100">
              <button
                onClick={() => onTabChange('orders')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                View all orders →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions + Sales Summary */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => onTabChange('products')}
                className="flex flex-col items-center gap-2 p-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Plus size={20} />
                <span className="text-xs font-semibold uppercase tracking-wider">New Product</span>
              </button>
              <button
                onClick={() => onTabChange('orders')}
                className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Eye size={20} />
                <span className="text-xs font-semibold uppercase tracking-wider">View Orders</span>
              </button>
              <button
                onClick={() => onTabChange('users')}
                className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Users size={20} />
                <span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
              </button>
              <button
                onClick={() => onTabChange('hero-slider')}
                className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Package size={20} />
                <span className="text-xs font-semibold uppercase tracking-wider">Hero Slides</span>
              </button>
            </div>
          </div>

          {/* Sales by Month */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Sales by Month</h2>
            </div>
            <div className="p-4">
              {analytics?.salesByMonth?.length ? (
                <ul className="space-y-2">
                  {analytics.salesByMonth.slice(0, 5).map((m: any) => (
                    <li key={m._id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">{m._id}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{formatINR(m.total)}</span>
                        <span className="text-gray-400 text-xs ml-1">({m.count})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No sales data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
