import React, { useState, useEffect, useCallback } from 'react';
import {
  Check, X, Eye, Search, RefreshCw, AlertTriangle,
  Clock, CheckCircle, XCircle, RotateCcw,
} from 'lucide-react';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { formatINR } from '../../utils/currency';

// ── Types ──────────────────────────────────────────────────────────────────────
type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

interface ReturnItem {
  product: { _id: string; name: string; price: number; images: string[] } | null;
  quantity: number;
  size?: string;
  reason?: string;
}

interface ReturnRequest {
  _id: string;
  order: { _id: string; total: number; createdAt: string } | null;
  user: { _id: string; name: string; email: string } | null;
  items: ReturnItem[];
  reason: string;
  status: ReturnStatus;
  refundAmount: number;
  adminNotes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const shortOrderId = (id?: string) =>
  id ? `#ORD-${id.slice(-4).toUpperCase()}` : '—';

const statusConfig: Record<ReturnStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  pending:    { label: 'Pending',    icon: <Clock size={11} />,        classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved:   { label: 'Approved',   icon: <CheckCircle size={11} />,  classes: 'bg-green-50 text-green-700 border-green-200' },
  rejected:   { label: 'Rejected',   icon: <XCircle size={11} />,      classes: 'bg-red-50 text-red-700 border-red-200' },
  processing: { label: 'Processing', icon: <RefreshCw size={11} />,    classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed:  { label: 'Completed',  icon: <CheckCircle size={11} />,  classes: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const StatusBadge: React.FC<{ status: ReturnStatus }> = ({ status }) => {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.classes}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ── Detail Modal ───────────────────────────────────────────────────────────────
const ReturnDetailModal: React.FC<{
  ret: ReturnRequest;
  onClose: () => void;
  onStatusChange: (id: string, status: ReturnStatus, notes: string) => Promise<void>;
}> = ({ ret, onClose, onStatusChange }) => {
  const [notes, setNotes] = useState(ret.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const handle = async (status: ReturnStatus) => {
    setSaving(true);
    await onStatusChange(ret._id, status, notes);
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Return Details</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{shortOrderId(ret.order?._id)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer + Status */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">{ret.user?.name || '—'}</p>
              <p className="text-xs text-gray-400">{ret.user?.email || '—'}</p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <StatusBadge status={ret.status} />
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Return Reason</p>
            <p className="text-sm text-gray-700">{ret.reason || '—'}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>
            <div className="space-y-2">
              {ret.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {item.product?.price ? formatINR(item.product.price * item.quantity) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Refund */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Refund Amount</p>
            <p className="text-base font-bold text-gray-900">{formatINR(ret.refundAmount || 0)}</p>
          </div>

          {/* Return proof images */}
          {ret.images && ret.images.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Return Proof</p>
              <div className="flex gap-2 flex-wrap">
                {ret.images.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer">
                    <img src={img} alt={`proof-${i}`} className="w-16 h-16 object-cover rounded-lg border border-gray-100 hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes for this return..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* Action buttons — only show if still actionable */}
          {(ret.status === 'pending' || ret.status === 'processing') && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handle('rejected')}
                disabled={saving}
                className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X size={15} /> Reject
              </button>
              <button
                onClick={() => handle('approved')}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                Approve
              </button>
            </div>
          )}

          {ret.status === 'approved' && (
            <button
              onClick={() => handle('completed')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} /> Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminReturnsTab: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [viewingReturn, setViewingReturn] = useState<ReturnRequest | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/returns');
      setReturns(res.data);
    } catch {
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleStatusChange = async (id: string, status: ReturnStatus, adminNotes: string) => {
    try {
      const res = await api.put(`/api/returns/${id}/status`, { status, adminNotes });
      setReturns((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      toast.success(`Return ${status}`);
    } catch {
      toast.error('Failed to update return');
    }
  };

  // Quick-action approve/reject directly from list row
  const quickAction = async (ret: ReturnRequest, status: ReturnStatus) => {
    try {
      const res = await api.put(`/api/returns/${ret._id}/status`, { status, adminNotes: ret.adminNotes || '' });
      setReturns((prev) => prev.map((r) => (r._id === ret._id ? res.data : r)));
      toast.success(`Return ${status}`);
    } catch {
      toast.error('Failed to update return');
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const pending   = returns.filter((r) => r.status === 'pending');
  const approved  = returns.filter((r) => r.status === 'approved');
  const rejected  = returns.filter((r) => r.status === 'rejected');
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const processedToday = returns.filter((r) => {
    const d = new Date(r.updatedAt); d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && r.status !== 'pending';
  });

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = returns.filter((r) => {
    const matchTab =
      filterTab === 'all' ||
      r.status === filterTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.order?._id?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q) ||
      shortOrderId(r.order?._id).toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = filtered.length > paginated.length;

  const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pending Returns — hero card */}
        <div className="sm:col-span-2 xl:col-span-2 bg-black text-white rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Pending Returns</p>
            <RotateCcw size={18} className="text-white/40" />
          </div>
          <p className="text-5xl font-black">{String(pending.length).padStart(3, '0')}</p>
          <p className="text-xs text-white/40">
            {pending.length === 0 ? 'All clear' : `${pending.length} awaiting review`}
          </p>
        </div>

        {/* Processed Today */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Processed Today</p>
            <Check size={16} className="text-gray-400" />
          </div>
          <p className="text-4xl font-black text-gray-900">{String(processedToday.length).padStart(2, '0')}</p>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all"
              style={{ width: returns.length ? `${Math.min((processedToday.length / returns.length) * 100, 100)}%` : '0%' }}
            />
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-white border border-red-200 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Action Required</p>
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <p className="text-4xl font-black text-red-500">{String(pending.length).padStart(2, '0')}</p>
          <p className="text-xs text-red-400">Urgent attention needed</p>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-black">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search order ID or customer..."
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100 overflow-x-auto">
          {FILTER_TABS.map(({ id, label }) => {
            const count = id === 'all' ? returns.length
              : id === 'pending' ? pending.length
              : id === 'approved' ? approved.length
              : rejected.length;
            return (
              <button
                key={id}
                onClick={() => { setFilterTab(id); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterTab === id
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filterTab === id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        <div>
          {/* Table header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 grid grid-cols-[1fr_auto] gap-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order / Customer</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</p>
          </div>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RotateCcw size={28} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium">No returns found</p>
              {search && <p className="text-xs mt-1">Try a different search term</p>}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {paginated.map((ret) => {
                const isPending = ret.status === 'pending';
                return (
                  <div key={ret._id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: order info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900 font-mono">
                            {shortOrderId(ret.order?._id)}
                          </span>
                          <StatusBadge status={ret.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{ret.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{ret.reason}</p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {ret.refundAmount ? ` · ${formatINR(ret.refundAmount)}` : ''}
                        </p>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Approve tick */}
                        <button
                          onClick={() => isPending && quickAction(ret, 'approved')}
                          disabled={!isPending}
                          title="Approve"
                          className={`p-1.5 rounded-lg transition-colors ${
                            isPending
                              ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              : 'text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <Check size={16} />
                        </button>

                        {/* Reject cross */}
                        <button
                          onClick={() => isPending && quickAction(ret, 'rejected')}
                          disabled={!isPending}
                          title="Reject"
                          className={`p-1.5 rounded-lg transition-colors ${
                            isPending
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <X size={16} />
                        </button>

                        {/* View */}
                        <button
                          onClick={() => setViewingReturn(ret)}
                          className="text-xs font-semibold text-gray-500 hover:text-black underline underline-offset-2 transition-colors px-1"
                        >
                          VIEW
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="px-4 py-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="w-full border border-gray-200 rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
              >
                Load More Returns
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Real-time analytics banner ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-1">Real-Time Analytics</p>
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          System Status: {loading ? 'Loading…' : 'Optimal'}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-2xl font-black text-gray-900">{returns.length}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Total</p>
          </div>
          <div>
            <p className="text-2xl font-black text-green-600">{approved.length}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Approved</p>
          </div>
          <div>
            <p className="text-2xl font-black text-red-500">{rejected.length}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Rejected</p>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {viewingReturn && (
        <ReturnDetailModal
          ret={viewingReturn}
          onClose={() => setViewingReturn(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default AdminReturnsTab;
