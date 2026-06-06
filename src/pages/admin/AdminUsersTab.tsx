import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, Shield, User } from 'lucide-react';
import api from '../../config/axios';
import { toast } from 'react-toastify';

interface AdminUsersTabProps {
  users: any[];
  setUsers: (u: any[]) => void;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ users, setUsers }) => {
  const [editingId, setEditingId] = useState<string>('');
  const [editRole, setEditRole] = useState('user');

  const getInitials = (name: string) =>
    name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const handleEdit = (user: any) => {
    setEditingId(user._id);
    setEditRole(user.role);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/api/users/${editingId}`, { role: editRole });
      setUsers(users.map((u) => (u._id === editingId ? { ...u, role: editRole } : u)));
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update user role');
    }
    setEditingId('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Customers</h2>
        <p className="text-xs text-gray-400 mt-0.5">{users.length} registered users</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    {editingId === user._id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <button onClick={handleEditSave} className="p-1.5 bg-black text-white rounded-lg hover:bg-gray-800">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId('')} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
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
    </div>
  );
};

export default AdminUsersTab;
