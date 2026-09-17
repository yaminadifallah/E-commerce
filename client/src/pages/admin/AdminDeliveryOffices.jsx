import { useEffect, useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import api from '../../api/axios.js';

export default function AdminDeliveryOffices() {
  const [offices, setOffices] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', wilayaId: '', active: true });

  function fetchAll() {
    api.get('/admin/delivery-offices').then((res) => setOffices(res.data.offices));
    api.get('/admin/wilayas').then((res) => setWilayas(res.data.wilayas));
  }
  useEffect(fetchAll, []);

  function openNew() {
    setForm({ name: '', address: '', phone: '', wilayaId: '', active: true });
    setEditing('new');
  }
  function openEdit(o) {
    setForm({ name: o.name, address: o.address, phone: o.phone, wilayaId: o.wilayaId, active: o.active });
    setEditing(o);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editing === 'new') {
      await api.post('/admin/delivery-offices', form);
    } else {
      await api.put(`/admin/delivery-offices/${editing.id}`, form);
    }
    setEditing(null);
    fetchAll();
  }

  async function handleDelete(o) {
    if (!confirm(`Delete "${o.name}"?`)) return;
    await api.delete(`/admin/delivery-offices/${o.id}`);
    fetchAll();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-mist">Delivery Offices</h1>
        <button onClick={openNew} className="btn-primary"><Plus size={16} /> Add Office</button>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-softer text-mist-dim">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Wilaya</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offices.map((o) => (
              <tr key={o.id} className="border-t border-ink-line">
                <td className="px-4 py-3 text-mist">{o.name}</td>
                <td className="px-4 py-3 text-mist-dim">{o.wilaya?.name}</td>
                <td className="px-4 py-3 text-mist-dim">{o.address}</td>
                <td className="px-4 py-3 text-mist-dim">{o.phone}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${o.active ? 'bg-green-500/15 text-green-400' : 'bg-ink-softer text-mist-dim'}`}>
                    {o.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(o)} className="text-signal hover:text-signal-light">Edit</button>
                    <button onClick={() => handleDelete(o)} className="text-mist-dim hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="card-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display font-semibold text-mist">{editing === 'new' ? 'Add Office' : 'Edit Office'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-mist-dim" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Office name" className="input-field" required />
              <select value={form.wilayaId} onChange={(e) => setForm({ ...form, wilayaId: e.target.value })} className="input-field" required>
                <option value="">Select wilaya</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
              </select>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="input-field" required />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input-field" required />
              <label className="flex items-center gap-2 text-sm text-mist">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active
              </label>
              <button type="submit" className="btn-primary w-full">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
