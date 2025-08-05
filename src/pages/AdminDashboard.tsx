import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../config/axios';
import {
  Users, ShoppingBag, TrendingUp, Eye, Edit, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { formatINR, convertUSDToINR } from '../utils/currency';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'products'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || user?.role !== 'admin') {
        return navigate('/');
      }

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

    fetchDashboardData();
  }, [token, user, navigate]);

  const totalRevenue = Array.isArray(orders) ? orders.reduce((acc, order) => acc + order.total, 0) : 0;
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
              { id: 'products', name: 'Products', icon: ShoppingBag },
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
              <div className="bg-green-100 p-4 rounded">
                <div className="text-lg font-bold">Total Revenue</div>
                <div className="text-2xl">{formatINR(convertUSDToINR(analytics?.totalSales ?? totalRevenue))}</div>
              </div>
              <div className="bg-blue-100 p-4 rounded">
                <div className="text-lg font-bold">Total Orders</div>
                <div className="text-2xl">{analytics?.totalOrders ?? (Array.isArray(orders) ? orders.length : 0)}</div>
              </div>
              <div className="bg-purple-100 p-4 rounded">
                <div className="text-lg font-bold">Total Users</div>
                <div className="text-2xl">{analytics?.totalUsers ?? users.length}</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Sales by Month</h3>
              <div className="bg-white p-4 rounded shadow">
                {analytics?.salesByMonth?.length ? (
                  <ul className="space-y-1">
                    {analytics.salesByMonth.map((m: any) => (
                      <li key={m._id} className="flex justify-between">
                        <span>{m._id}</span>
                        <span>{formatINR(convertUSDToINR(m.total))} ({m.count} orders)</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No sales data available.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Recent Orders</h3>
              {Array.isArray(orders) && token && <OrderTable orders={orders.slice(0, 5)} setOrders={setOrders} token={token} adminMode={false} />}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && Array.isArray(orders) && token && <OrderTable orders={orders} setOrders={setOrders} token={token} adminMode={true} />}

        {/* Users Tab */}
        {activeTab === 'users' && Array.isArray(users) && token && <UsersTable users={users} setUsers={setUsers} token={token} />}

        {/* Products Tab */}
        {activeTab === 'products' && Array.isArray(products) && token && <ProductTable products={products} setProducts={setProducts} token={token} />}
      </div>
    </div>
  );
};

export default AdminDashboard;

// Inline OrderTable component
const OrderTable: React.FC<{ orders: any[]; setOrders: (o: any[]) => void; token: string; adminMode: boolean }> = ({ orders, setOrders, token, adminMode }) => {
  const [editingId, setEditingId] = useState<string>('');
  const [editStatus, setEditStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrderClick = async (orderId: string) => {
    try {
      // Fetch detailed order information
      const response = await api.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      // Fallback to using the order from the list
      const order = orders.find(o => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
        setIsModalOpen(true);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleEdit = (order: any) => {
    setEditingId(order._id);
    setEditStatus(order.status);
  };
  const handleEditSave = async () => {
    await api.put(`/api/orders/${editingId}/status`, { status: editStatus });
    setOrders(orders.map(o => (o._id === editingId ? { ...o, status: editStatus } : o)));
    setEditingId('');
  };
  const handleDelete = async (id: string) => {
    await api.delete(`/api/orders/${id}`);
    setOrders(orders.filter(o => o._id !== id));
  };
  return (
    <>
      <table className="min-w-full bg-white border mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Order ID</th>
            <th className="px-4 py-2 border">User</th>
            <th className="px-4 py-2 border">Total</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Date</th>
            {adminMode && <th className="px-4 py-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr
              key={order._id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleOrderClick(order._id)}
            >
              <td className="border px-4 py-2">{order._id}</td>
              <td className="border px-4 py-2">{order.user?.name || 'N/A'}</td>
              <td className="border px-4 py-2">{formatINR(convertUSDToINR(order.total ?? 0))}</td>
              <td className="border px-4 py-2">
                {editingId === order._id ? (
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="border px-2 py-1"
                    onClick={e => e.stopPropagation()}
                  >
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  order.status
                )}
              </td>
              <td className="border px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
              {adminMode && (
                <td className="border px-4 py-2">
                  {editingId === order._id ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditSave(); }}
                        className="text-green-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(''); }}
                        className="text-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(order); }}
                        className="text-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(order._id); }}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
// Inline UsersTable component
const UsersTable: React.FC<{ users: any[]; setUsers: (u: any[]) => void; token: string }> = ({ users, setUsers, token }) => {
  if (!Array.isArray(users)) return <div>No users data.</div>;
  const [editingId, setEditingId] = useState<string>('');
  const [editRole, setEditRole] = useState('user');
  const handleEdit = (user: any) => {
    setEditingId(user._id);
    setEditRole(user.role);
  };
  const handleEditSave = async () => {
    await api.put(`/api/users/${editingId}`, { role: editRole });
    setUsers(users.map(u => (u._id === editingId ? { ...u, role: editRole } : u)));
    setEditingId('');
  };
  const handleDelete = async (id: string) => {
    await api.delete(`/api/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };
  return (
    <table className="min-w-full bg-white border mt-4">
      <thead>
        <tr>
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Email</th>
          <th className="px-4 py-2 border">Role</th>
          <th className="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td className="border px-4 py-2">{user.name}</td>
            <td className="border px-4 py-2">{user.email}</td>
            <td className="border px-4 py-2">
              {editingId === user._id ? (
                <select value={editRole} onChange={e => setEditRole(e.target.value)} className="border px-2 py-1">
                  {['user', 'admin'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : (
                user.role
              )}
            </td>
            <td className="border px-4 py-2">
              {editingId === user._id ? (
                <>
                  <button onClick={handleEditSave} className="text-green-600 mr-2">Save</button>
                  <button onClick={() => setEditingId('')} className="text-gray-600">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(user)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(user._id)} className="text-red-600">Delete</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ProductTable component
const ProductTable: React.FC<{ products: any[]; setProducts: (p: any[]) => void; token: string }> = ({ products, setProducts, token }) => {
  if (!Array.isArray(products)) return <div>No products data.</div>;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newProduct, setNewProduct] = useState<any>({ name: '', price: '', stock: '', category: '', description: '', images: [''] });
  const handleEdit = (product: any) => {
    setEditingId(product._id);
    setEditForm({ ...product, images: product.images || [''] });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleImageChange = (index: number, value: string, isEdit: boolean = false) => {
    if (isEdit) {
      const newImages = [...(editForm.images || [''])];
      newImages[index] = value;
      setEditForm({ ...editForm, images: newImages });
    } else {
      const newImages = [...(newProduct.images || [''])];
      newImages[index] = value;
      setNewProduct({ ...newProduct, images: newImages });
    }
  };
  const addImageField = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditForm({ ...editForm, images: [...(editForm.images || ['']), ''] });
    } else {
      setNewProduct({ ...newProduct, images: [...(newProduct.images || ['']), ''] });
    }
  };
  const removeImageField = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      const newImages = editForm.images.filter((_: any, i: number) => i !== index);
      setEditForm({ ...editForm, images: newImages.length ? newImages : [''] });
    } else {
      const newImages = newProduct.images.filter((_: any, i: number) => i !== index);
      setNewProduct({ ...newProduct, images: newImages.length ? newImages : [''] });
    }
  };
  const handleEditSave = async () => {
    await api.put(`/api/products/${editingId}`, editForm);
    setProducts(products.map(p => (p._id === editingId ? { ...p, ...editForm } : p)));
    setEditingId(null);
  };
  const handleDelete = async (id: string) => {
    await api.delete(`/api/products/${id}`);
    setProducts(products.filter(p => p._id !== id));
  };
  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };
  const handleAdd = async () => {
    const productData = {
      ...newProduct,
      images: newProduct.images.filter((img: string) => img.trim() !== '')
    };
    const res = await api.post('/api/products', productData);
    setProducts([...products, res.data]);
    setNewProduct({ name: '', price: '', stock: '', category: '', description: '', images: [''] });
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Image</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Stock</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td className="border px-4 py-2">
                {editingId === product._id ? (
                  <div className="space-y-2">
                    {(editForm.images || ['']).map((img: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => handleImageChange(index, e.target.value, true)}
                          className="border px-2 py-1 text-xs w-32"
                          placeholder="Image URL"
                        />
                        {editForm.images.length > 1 && (
                          <button
                            onClick={() => removeImageField(index, true)}
                            className="text-red-500 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addImageField(true)}
                      className="text-blue-500 text-xs"
                    >
                      + Add Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {product.images && product.images.length > 0 ? (
                      product.images.slice(0, 2).map((img: string, index: number) => (
                        <img
                          key={index}
                          src={img}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                          }}
                        />
                      ))
                    ) : (product as any).image ? (
                      <img
                        src={(product as any).image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No Image
                      </div>
                    )}
                    {product.images && product.images.length > 2 && (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">
                        +{product.images.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </td>
              <td className="border px-4 py-2">
                {editingId === product._id ? (
                  <input name="name" value={editForm.name} onChange={handleEditChange} className="border px-2 py-1" />
                ) : (
                  product.name
                )}
              </td>
              <td className="border px-4 py-2">
                {editingId === product._id ? (
                  <input name="price" value={editForm.price} onChange={handleEditChange} className="border px-2 py-1" />
                ) : (
                  product.price
                )}
              </td>
              <td className="border px-4 py-2">
                {editingId === product._id ? (
                  <input name="stock" value={editForm.stock} onChange={handleEditChange} className="border px-2 py-1" />
                ) : (
                  product.stock
                )}
              </td>
              <td className="border px-4 py-2">
                {editingId === product._id ? (
                  <input name="category" value={editForm.category} onChange={handleEditChange} className="border px-2 py-1" />
                ) : (
                  product.category
                )}
              </td>
              <td className="border px-4 py-2">
                {editingId === product._id ? (
                  <>
                    <button onClick={handleEditSave} className="text-green-600 mr-2">Save</button>
                    <button onClick={() => setEditingId('')} className="text-gray-600">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(product)} className="text-blue-600 mr-2">Edit</button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border px-4 py-2">
              <div className="space-y-2">
                {(newProduct.images || ['']).map((img: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value, false)}
                      className="border px-2 py-1 text-xs w-32"
                      placeholder="Image URL"
                    />
                    {newProduct.images.length > 1 && (
                      <button
                        onClick={() => removeImageField(index, false)}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addImageField(false)}
                  className="text-blue-500 text-xs"
                >
                  + Add Image
                </button>
              </div>
            </td>
            <td className="border px-4 py-2">
              <input name="name" value={newProduct.name} onChange={handleNewChange} className="border px-2 py-1" placeholder="Name" />
            </td>
            <td className="border px-4 py-2">
              <input name="price" value={newProduct.price} onChange={handleNewChange} className="border px-2 py-1" placeholder="Price" />
            </td>
            <td className="border px-4 py-2">
              <input name="stock" value={newProduct.stock} onChange={handleNewChange} className="border px-2 py-1" placeholder="Stock" />
            </td>
            <td className="border px-4 py-2">
              <input name="category" value={newProduct.category} onChange={handleNewChange} className="border px-2 py-1" placeholder="Category" />
            </td>
            <td className="border px-4 py-2">
              <button onClick={handleAdd} className="text-green-600">Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
