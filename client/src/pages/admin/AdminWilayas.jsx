import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../../api/axios.js';

export default function AdminWilayas() {
  const [wilayas, setWilayas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', deliveryPrice: '', estimatedDays: '', active: true });

  function fetchAll() {
    api.get('/admin/wilayas').then((res) => setWilayas(res.data.wilayas));
  }
  useEffect(fetchAll, []);

  function openNew() {
    setForm({ code: '', name: '', deliveryPrice: '', estimatedDays: '', active: true });
    setEditing('new');
  }
  function openEdit(w) {
    setForm({ code: w.code, name: w.name, deliveryPrice: w.deliveryPrice, estimatedDays: w.estimatedDays, active: w.active });
    setEditing(w);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editing === 'new') {
      await api.post('/admin/wilayas', form);
    } else {
      await api.put(`/admin/wilayas/${editing.id}`, form);
    }
    setEditing(null);
    fetchAll();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-mist">Wilayas</h1>
        <button onClick={openNew} className="btn-primary"><Plus size={16} /> Add Wilaya</button>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-softer text-mist-dim">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Delivery Price</th>
              <th className="px-4 py-3">Est. Days</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wilayas.map((w) => (
              <tr key={w.id} className="border-t border-ink-line">
                <td className="px-4 py-3 text-mist-dim">{w.code}</td>
                <td className="px-4 py-3 text-mist">{w.name}</td>
                <td className="px-4 py-3 text-mist-dim">{w.deliveryPrice} DA</td>
                <td className="px-4 py-3 text-mist-dim">{w.estimatedDays}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${w.active ? 'bg-green-500/15 text-green-400' : 'bg-ink-softer text-mist-dim'}`}>
                    {w.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(w)} className="text-signal hover:text-signal-light">Edit</button>
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
              <h2 className="font-display font-semibold text-mist">{editing === 'new' ? 'Add Wilaya' : 'Edit Wilaya'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-mist-dim" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code (e.g. 16)" className="input-field" required />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input-field" required />
              <input type="number" value={form.deliveryPrice} onChange={(e) => setForm({ ...form, deliveryPrice: e.target.value })} placeholder="Delivery price (DA)" className="input-field" required />
              <input type="number" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} placeholder="Estimated days" className="input-field" required />
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
