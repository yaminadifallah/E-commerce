import { useEffect, useState } from 'react';
import { Plus, X, ShieldCheck, ShieldOff, ListChecks } from 'lucide-react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ACTION_LABELS = {
  ORDER_STATUS_UPDATED: 'Updated an order status',
  PRODUCT_CREATED: 'Created a product',
  PRODUCT_UPDATED: 'Updated a product',
  PRODUCT_DELETED: 'Deleted a product',
  PRODUCT_DEACTIVATED: 'Deactivated a product',
  PROMOTION_UPDATED: 'Changed a promotion',
  PRODUCTS_BULK_IMPORTED: 'Bulk-imported products',
  USER_CREATED: 'Created a staff account',
  USER_UPDATED: 'Updated a staff account',
  USER_DEACTIVATED: 'Deactivated a staff account',
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('staff'); // 'staff' | 'activity'
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState(null);
  const [filterUserId, setFilterUserId] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SELLER' });
  const [error, setError] = useState('');

  function fetchUsers() {
    api.get('/admin/users').then((res) => setUsers(res.data.users)).catch(() => {});
  }

  function fetchLogs() {
    const params = filterUserId ? { userId: filterUserId } : {};
    api.get('/admin/users/activity/log', { params }).then((res) => setLogs(res.data.logs)).catch(() => {});
  }

  useEffect(fetchUsers, []);
  useEffect(() => {
    if (tab === 'activity') fetchLogs();
  }, [tab, filterUserId]);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="card-surface p-8 text-center">
        <p className="font-display text-lg font-semibold text-mist">Access restricted</p>
        <p className="mt-2 text-sm text-mist-dim">Only Admin accounts can manage staff and view the activity log.</p>
      </div>
    );
  }


  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/users', form);
      setShowNew(false);
      setForm({ name: '', email: '', password: '', role: 'SELLER' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    }
  }

  async function toggleActive(u) {
    if (u.id === currentUser.id) return;
    await api.put(`/admin/users/${u.id}`, { active: !u.active });
    fetchUsers();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-mist">Staff & Activity</h1>
        {tab === 'staff' && (
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <Plus size={16} /> Add Staff Account
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setTab('staff')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${tab === 'staff' ? 'bg-signal text-white' : 'border border-ink-line text-mist-dim'}`}
        >
          Staff Accounts
        </button>
        <button
          onClick={() => setTab('activity')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${tab === 'activity' ? 'bg-signal text-white' : 'border border-ink-line text-mist-dim'}`}
        >
          <ListChecks size={14} className="mr-1 inline" /> Activity Log
        </button>
      </div>

      {tab === 'staff' ? (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-softer text-mist-dim">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions Logged</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-ink-line">
                  <td className="px-4 py-3 text-mist">{u.name} {u.id === currentUser.id && <span className="text-xs text-mist-dim">(you)</span>}</td>
                  <td className="px-4 py-3 text-mist-dim">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-signal/15 text-signal' : 'bg-ink-softer text-mist-dim'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setTab('activity'); setFilterUserId(String(u.id)); }}
                      className="text-signal hover:text-signal-light"
                    >
                      {u._count?.activityLogs ?? 0} actions
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.active ? 'bg-green-500/15 text-green-400' : 'bg-ink-softer text-mist-dim'}`}>
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => toggleActive(u)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-mist-dim hover:text-signal"
                      >
                        {u.active ? <><ShieldOff size={14} /> Deactivate</> : <><ShieldCheck size={14} /> Reactivate</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="input-field w-auto"
            >
              <option value="">All staff</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {logs === null ? (
            <p className="text-mist-dim">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-mist-dim">No activity recorded yet.</p>
          ) : (
            <div className="card-surface divide-y divide-ink-line">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm text-mist">
                      <span className="font-medium">{log.user.name}</span>{' '}
                      <span className="text-mist-dim">({log.user.role})</span> — {ACTION_LABELS[log.action] || log.action}
                    </p>
                    {log.details && <p className="mt-1 text-xs text-mist-dim">{log.details}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-mist-dim">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="card-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display font-semibold text-mist">Add Staff Account</h2>
              <button onClick={() => setShowNew(false)}><X size={18} className="text-mist-dim" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="input-field" required />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input-field" required />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min. 8 characters)" className="input-field" required />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="SELLER">Seller (manages orders & products)</option>
                <option value="ADMIN">Admin (full access, incl. staff management)</option>
              </select>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" className="btn-primary w-full">Create Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
