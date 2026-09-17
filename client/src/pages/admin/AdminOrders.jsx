import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../api/axios.js';

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS = {
  PENDING: '#FFB020', CONFIRMED: '#6C5CE7', PREPARING: '#8B7FF0',
  SHIPPED: '#2563EB', DELIVERED: '#16A34A', CANCELLED: '#DC2626',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(() => {
    const params = { page, limit: 15 };
    if (status !== 'ALL') params.status = status;
    if (q) params.q = q;
    api.get('/admin/orders', { params }).then((res) => {
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    });
  }, [status, q, page]);

  useEffect(() => {
    const t = setTimeout(fetchOrders, 250);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-mist">Orders</h1>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-dim" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by order #, name, phone..."
            className="input-field w-72 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? 'bg-signal text-white' : 'border border-ink-line text-mist-dim'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {orders === null ? (
        <p className="text-mist-dim">Loading...</p>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-softer text-mist-dim">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Wilaya</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink-line">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${o.id}`} className="text-signal hover:text-signal-light">{o.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-mist">{o.customerName}</td>
                  <td className="px-4 py-3 text-mist-dim">{o.customerPhone}</td>
                  <td className="px-4 py-3 text-mist-dim">{o.wilaya?.name}</td>
                  <td className="px-4 py-3 text-mist">{o.total} DA</td>
                  <td className="px-4 py-3 text-mist-dim">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="rounded-full border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-signal disabled:opacity-60"
                      style={{ background: `${STATUS_COLORS[o.status]}22`, color: STATUS_COLORS[o.status] }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} style={{ color: '#111' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-full text-sm ${page === i + 1 ? 'bg-signal text-white' : 'border border-ink-line text-mist-dim'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
