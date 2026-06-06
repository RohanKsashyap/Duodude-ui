import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, Tag, FolderOpen, X, Check, AlertCircle } from 'lucide-react';
import api from '../../config/axios';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  parent: { _id: string; name: string; slug: string } | null;
  createdAt: string;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  parent: string;
  active: boolean;
}

const EMPTY_FORM: FormState = { name: '', slug: '', description: '', parent: '', active: true };

// ── Slug preview helper ────────────────────────────────────────────────────────
const toSlug = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Category Form Modal ────────────────────────────────────────────────────────
const CategoryFormModal: React.FC<{
  isOpen: boolean;
  title: string;
  form: FormState;
  setForm: (f: FormState) => void;
  parentOptions: Category[];
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}> = ({ isOpen, title, form, setForm, parentOptions, onSave, onClose, saving }) => {
  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-fill slug only if user hasn't manually edited it
    setForm({ ...form, name, slug: toSlug(name) });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Parent selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Top-level category (e.g. Men, Women)</option>
              {parentOptions.map((p) => (
                <option key={p._id} value={p._id}>
                  Subcategory of: {p.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Leave blank to create a top-level category like "Men" or "Women".
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              value={form.name}
              onChange={handleNameChange}
              placeholder="e.g. Men, T-Shirts, Hoodies..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Slug
            </label>
            <input
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="auto-generated from name"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-gray-400 mt-1">URL-friendly identifier. Auto-filled from name.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Optional description..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-black' : 'bg-gray-200'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium">{form.active ? 'Active' : 'Inactive'}</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.name.trim()}
            className="px-5 py-2.5 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Save Category
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminCategoriesTab: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [addForm, setAddForm] = useState<FormState>({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Only top-level categories as parent options
  const topLevelCategories = categories.filter((c) => !c.parent);

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/api/categories', {
        name: addForm.name.trim(),
        slug: addForm.slug.trim() || toSlug(addForm.name),
        parent: addForm.parent || null,
        description: addForm.description.trim(),
        active: addForm.active,
      });
      setCategories((prev) => [...prev, res.data]);
      toast.success('Category created');
      setAddForm({ ...EMPTY_FORM });
      setShowAddModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent: cat.parent?._id || '',
      active: cat.active,
    });
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim() || !editingId) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/categories/${editingId}`, {
        name: editForm.name.trim(),
        slug: editForm.slug.trim(),
        parent: editForm.parent || null,
        description: editForm.description.trim(),
        active: editForm.active,
      });
      setCategories((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
      toast.success('Category updated');
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    }
  };

  // Group: top-level first, then subcategories nested under them
  const grouped = topLevelCategories.map((parent) => ({
    parent,
    children: categories.filter((c) => c.parent?._id === parent._id),
  }));

  // Also catch orphaned subcategories (parent deleted)
  const orphaned = categories.filter(
    (c) => c.parent && !topLevelCategories.find((p) => p._id === c.parent?._id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Categories</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {topLevelCategories.length} top-level &middot;{' '}
              {categories.length - topLevelCategories.length} subcategories
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        {/* Info banner */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-start gap-2.5">
          <AlertCircle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            Top-level categories (e.g. <strong>Men</strong>, <strong>Women</strong>) appear as main navigation filters. Subcategories are nested under them and shown in the product upload form.
          </p>
        </div>

        {/* Category list */}
        <div className="p-6 space-y-4">
          {grouped.length === 0 && orphaned.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No categories yet</p>
              <p className="text-xs text-gray-300 mt-1">Click "Add Category" to create your first one.</p>
            </div>
          ) : (
            <>
              {grouped.map(({ parent, children }) => (
                <div key={parent._id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Parent row */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FolderOpen size={16} className="text-gray-400" />
                      <div>
                        <span className="text-sm font-bold text-gray-900">{parent.name}</span>
                        <span className="ml-2 text-xs font-mono text-gray-400">/{parent.slug}</span>
                      </div>
                      {!parent.active && (
                        <span className="px-2 py-0.5 text-xs bg-red-50 text-red-500 rounded-full font-medium">
                          Inactive
                        </span>
                      )}
                      {children.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                          {children.length} sub
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(parent)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(parent._id, parent.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Children rows */}
                  {children.length > 0 && (
                    <div className="divide-y divide-gray-50">
                      {children.map((child) => (
                        <div key={child._id} className="flex items-center justify-between px-4 py-2.5 pl-10 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <ChevronRight size={12} className="text-gray-300" />
                            <Tag size={13} className="text-gray-300" />
                            <div>
                              <span className="text-sm text-gray-700">{child.name}</span>
                              <span className="ml-2 text-xs font-mono text-gray-400">/{child.slug}</span>
                            </div>
                            {!child.active && (
                              <span className="px-2 py-0.5 text-xs bg-red-50 text-red-500 rounded-full font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(child)}
                              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(child._id, child.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Orphaned subcategories */}
              {orphaned.length > 0 && (
                <div className="border border-orange-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-orange-50 text-xs text-orange-600 font-semibold flex items-center gap-2">
                    <AlertCircle size={12} /> Uncategorized subcategories (parent was deleted)
                  </div>
                  {orphaned.map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50">
                      <span className="text-sm text-gray-700">{cat.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <CategoryFormModal
        isOpen={showAddModal}
        title="New Category"
        form={addForm}
        setForm={setAddForm}
        parentOptions={topLevelCategories}
        onSave={handleAdd}
        onClose={() => { setShowAddModal(false); setAddForm({ ...EMPTY_FORM }); }}
        saving={saving}
      />

      {/* Edit Modal */}
      <CategoryFormModal
        isOpen={editingId !== null}
        title="Edit Category"
        form={editForm}
        setForm={setEditForm}
        parentOptions={topLevelCategories.filter((c) => c._id !== editingId)}
        onSave={handleEditSave}
        onClose={() => setEditingId(null)}
        saving={saving}
      />
    </div>
  );
};

export default AdminCategoriesTab;
