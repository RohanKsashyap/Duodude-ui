import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Check, X } from 'lucide-react';
import api from '../../config/axios';
import ImageUploader from '../../components/ImageUploader';
import { formatINR } from '../../utils/currency';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: { _id: string; name: string } | null;
  active: boolean;
}

interface AdminProductsTabProps {
  products: any[];
  setProducts: (p: any[]) => void;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'];
const AVAILABLE_COLORS = [
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Red', value: 'red', hex: '#EF4444' },
  { name: 'Blue', value: 'blue', hex: '#3B82F6' },
  { name: 'Green', value: 'green', hex: '#22C55E' },
  { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
  { name: 'Purple', value: 'purple', hex: '#8B5CF6' },
  { name: 'Pink', value: 'pink', hex: '#EC4899' },
  { name: 'Orange', value: 'orange', hex: '#F97316' },
  { name: 'Brown', value: 'brown', hex: '#8B4513' },
  { name: 'Gray', value: 'gray', hex: '#6B7280' },
  { name: 'Navy', value: 'navy', hex: '#1E3A8A' },
];

const EMPTY_PRODUCT = {
  name: '', price: '', stock: '', category: '', subcategory: '', description: '',
  images: [''], sizes: [] as string[], colors: [] as string[], featured: false, new: false,
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const SizeSelector: React.FC<{ selected: string[]; onChange: (s: string[]) => void }> = ({ selected, onChange }) => {
  const toggle = (size: string) =>
    onChange(selected.includes(size) ? selected.filter((s) => s !== size) : [...selected, size]);
  return (
    <div className="flex flex-wrap gap-1">
      {AVAILABLE_SIZES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          className={`px-2 py-0.5 text-xs border rounded transition-colors ${
            selected.includes(s)
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

const ColorSelector: React.FC<{ selected: string[]; onChange: (c: string[]) => void }> = ({ selected, onChange }) => {
  const toggle = (color: string) =>
    onChange(selected.includes(color) ? selected.filter((c) => c !== color) : [...selected, color]);
  return (
    <div className="flex flex-wrap gap-1">
      {AVAILABLE_COLORS.map(({ name, value, hex }) => {
        const isSelected = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            title={name}
            className={`w-5 h-5 rounded-full border-2 transition-all ${
              isSelected ? 'border-black scale-110 shadow' : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: hex }}
          />
        );
      })}
    </div>
  );
};

// ── Product Form Modal ─────────────────────────────────────────────────────────
const ProductFormModal: React.FC<{
  isOpen: boolean;
  title: string;
  form: any;
  setForm: (f: any) => void;
  onSave: () => void;
  onClose: () => void;
  categories: Category[];
}> = ({ isOpen, title, form, setForm, onSave, onClose, categories }) => {
  if (!isOpen) return null;

  const topLevel = categories.filter((c) => !c.parent && c.active);
  const subcategories = categories.filter(
    (c) => c.parent && c.active && c.parent._id === form.category
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const updated = { ...form, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value };
    // Reset subcategory when category changes
    if (name === 'category') updated.subcategory = '';
    setForm(updated);
  };

  const handleImageChange = (index: number, url: string) => {
    const imgs = [...(form.images || [''])];
    imgs[index] = url;
    setForm({ ...form, images: imgs });
  };

  const addImage = () => setForm({ ...form, images: [...(form.images || ['']), ''] });
  const removeImage = (i: number) => {
    const imgs = form.images.filter((_: string, idx: number) => idx !== i);
    setForm({ ...form, images: imgs.length ? imgs : [''] });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Classic White Tee"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹) *</label>
            <input
              name="price" value={form.price} onChange={handleChange} type="number" min="0"
              placeholder="999"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Stock *</label>
            <input
              name="stock" value={form.stock} onChange={handleChange} type="number" min="0"
              placeholder="50"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select category...</option>
              {topLevel.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subcategory</label>
            <select
              name="subcategory" value={form.subcategory || ''} onChange={handleChange}
              disabled={!form.category || subcategories.length === 0}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!form.category ? 'Select a category first' : subcategories.length === 0 ? 'No subcategories available' : 'Select subcategory...'}
              </option>
              {subcategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Flags */}
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" name="featured" checked={form.featured}
                onChange={handleChange}
                className="w-4 h-4 accent-black"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" name="new" checked={form.new}
                onChange={handleChange}
                className="w-4 h-4 accent-black"
              />
              <span className="text-sm text-gray-700">New Arrival</span>
            </label>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Product description..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* Images */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Images</label>
            <div className="space-y-2">
              {(form.images || ['']).map((img: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    <ImageUploader
                      value={img}
                      onChange={(url) => handleImageChange(i, url)}
                      folder="/duodude/products"
                      placeholder="Upload or paste image URL"
                    />
                  </div>
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button" onClick={addImage}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors mt-1"
              >
                <Plus size={14} /> Add another image
              </button>
            </div>
          </div>

          {/* Sizes */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sizes</label>
            <SizeSelector
              selected={form.sizes || []}
              onChange={(sizes) => setForm({ ...form, sizes })}
            />
            {form.sizes?.length > 0 && (
              <p className="text-xs text-gray-400 mt-1.5">Selected: {form.sizes.join(', ')}</p>
            )}
          </div>

          {/* Colors */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Colors</label>
            <ColorSelector
              selected={form.colors || []}
              onChange={(colors) => setForm({ ...form, colors })}
            />
            {form.colors?.length > 0 && (
              <p className="text-xs text-gray-400 mt-1.5">Selected: {form.colors.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2.5 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Check size={16} /> Save Product
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminProductsTab: React.FC<AdminProductsTabProps> = ({ products, setProducts }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<any>({ ...EMPTY_PRODUCT });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/api/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Resolve category/subcategory IDs to names for display
  const getCategoryName = (id: string) => categories.find((c) => c._id === id)?.name || id || '—';

  const getFirstImage = (product: any): string | null => {
    if (product.images?.length) return product.images[0];
    if (product.image) return product.image;
    return null;
  };

  const openEdit = (product: any) => {
    setEditingId(product._id);
    setEditForm({
      ...product,
      images: product.images?.length ? product.images : [''],
      sizes: Array.isArray(product.sizes) ? product.sizes
        : typeof product.sizes === 'string' && product.sizes ? product.sizes.split(',').map((s: string) => s.trim()) : [],
      colors: Array.isArray(product.colors) ? product.colors
        : typeof product.colors === 'string' && product.colors ? product.colors.split(',').map((c: string) => c.trim()) : [],
      category: product.category || '',
      subcategory: product.subcategory || '',
    });
  };

  const handleEditSave = async () => {
    try {
      const data = {
        ...editForm,
        images: editForm.images.filter((img: string) => img.trim()),
        sizes: editForm.sizes.join(','),
        colors: editForm.colors.join(','),
        price: parseFloat(editForm.price) || 0,
        stock: parseInt(editForm.stock) || 0,
        category: editForm.category || '',
        subcategory: editForm.subcategory || '',
      };
      await api.put(`/api/products/${editingId}`, data);
      setProducts(products.map((p) => (p._id === editingId ? { ...p, ...data } : p)));
      toast.success('Product updated');
      setEditingId(null);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleAdd = async () => {
    try {
      const data = {
        ...newProduct,
        images: newProduct.images.filter((img: string) => img.trim()),
        sizes: newProduct.sizes.join(','),
        colors: newProduct.colors.join(','),
        price: parseFloat(newProduct.price) || 0,
        stock: parseInt(newProduct.stock) || 0,
        category: newProduct.category || '',
        subcategory: newProduct.subcategory || '',
      };
      const res = await api.post('/api/products', data);
      setProducts([...products, res.data]);
      toast.success('Product created');
      setNewProduct({ ...EMPTY_PRODUCT, images: [''], sizes: [], colors: [] });
      setShowAddModal(false);
    } catch {
      toast.error('Failed to create product');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Products</h2>
          <p className="text-xs text-gray-400 mt-0.5">{products.length} products in catalog</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Sizes</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No products found</td>
              </tr>
            ) : (
              products.map((product) => {
                const img = getFirstImage(product);
                const sizes = Array.isArray(product.sizes)
                  ? product.sizes.join(', ')
                  : typeof product.sizes === 'string' ? product.sizes : '—';
                return (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {img ? (
                            <img src={img} alt={product.name} className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{product.name}</p>
                          {product.featured && (
                            <span className="inline-block mt-0.5 text-xs bg-black text-white px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatINR(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 capitalize">{getCategoryName(product.category)}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">{sizes || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <ProductFormModal
        isOpen={editingId !== null}
        title="Edit Product"
        form={editForm}
        setForm={setEditForm}
        onSave={handleEditSave}
        onClose={() => setEditingId(null)}
        categories={categories}
      />

      {/* Add Modal */}
      <ProductFormModal
        isOpen={showAddModal}
        title="New Product"
        form={newProduct}
        setForm={setNewProduct}
        onSave={handleAdd}
        onClose={() => { setShowAddModal(false); setNewProduct({ ...EMPTY_PRODUCT, images: [''], sizes: [], colors: [] }); }}
        categories={categories}
      />
    </div>
  );
};

export default AdminProductsTab;
