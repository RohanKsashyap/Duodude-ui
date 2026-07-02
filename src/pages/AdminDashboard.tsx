import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Sliders, LogOut, Menu, X, Tag, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

import AdminOverview from './admin/AdminOverview';
import AdminOrdersTab from './admin/AdminOrdersTab';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminProductsTab from './admin/AdminProductsTab';
import AdminHeroSlider from './AdminHeroSlider';
import AdminCategoriesTab from './admin/AdminCategoriesTab';
import AdminReturnsTab from './admin/AdminReturnsTab';

type Tab = 'overview' | 'orders' | 'users' | 'products' | 'hero-slider' | 'categories' | 'returns';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Dashboard',   icon: <LayoutDashboard size={18} /> },
  { id: 'products',    label: 'Products',    icon: <Package size={18} /> },
  { id: 'categories',  label: 'Categories',  icon: <Tag size={18} /> },
  { id: 'orders',      label: 'Orders',      icon: <ShoppingBag size={18} /> },
  { id: 'returns',     label: 'Returns',     icon: <RotateCcw size={18} /> },
  { id: 'users',       label: 'Customers',   icon: <Users size={18} /> },
  { id: 'hero-slider', label: 'Hero Slider', icon: <Sliders size={18} /> },
];

const TAB_TITLES: Record<Tab, { title: string; subtitle: string }> = {
  overview:     { title: 'Dashboard',       subtitle: 'Welcome back, Admin' },
  orders:       { title: 'Orders',          subtitle: 'Manage customer orders' },
  users:        { title: 'Customers',       subtitle: 'View and manage users' },
  products:     { title: 'Products',        subtitle: 'Manage your catalog' },
  categories:   { title: 'Categories',      subtitle: 'Manage product categories' },
  'hero-slider':{ title: 'Hero Slider',     subtitle: 'Edit homepage slides' },
  returns:      { title: 'Return Management', subtitle: 'Review and action return requests' },
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/'); return; }
    const load = async () => {
      try {
        const [ordersRes, usersRes, productsRes, analyticsRes] = await Promise.all([
          api.get('/api/orders'),
          api.get('/api/users'),
          api.get('/api/products'),
          api.get('/api/orders/analytics'),
        ]);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user, navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { title, subtitle } = TAB_TITLES[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-black text-white flex flex-col z-30 transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="https://ik.imagekit.io/rohanKashyap/Duodude_images/logo/duodudelogo.png?updatedAt=1753712339931"
              alt="DuoDude"
              className="h-10 w-auto invert"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-white/10 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section label */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Core Management</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 pt-2 border-t border-white/10 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>

              <div>
                <h1 className="text-base font-bold text-gray-900 uppercase tracking-wide">{title}</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
              </div>
            </div>

            {/* Admin badge */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'overview' && (
            <AdminOverview
              orders={orders}
              users={users}
              products={products}
              analytics={analytics}
              onTabChange={handleTabChange}
            />
          )}
          {activeTab === 'orders' && (
            <AdminOrdersTab orders={orders} setOrders={setOrders} />
          )}
          {activeTab === 'users' && (
            <AdminUsersTab users={users} setUsers={setUsers} />
          )}
          {activeTab === 'products' && (
            <AdminProductsTab products={products} setProducts={setProducts} />
          )}
          {activeTab === 'categories' && <AdminCategoriesTab />}
          {activeTab === 'hero-slider' && <AdminHeroSlider />}
          {activeTab === 'returns' && <AdminReturnsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
