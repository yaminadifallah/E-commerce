import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { imageUrl } from '../../api/axios.js';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | category object
  const [form, setForm] = useState({ name: '', description: '', active: true });
  const [file, setFile] = useState(null);

  function fetchAll() {
    api.get('/admin/categories').then((res) => setCategories(res.data.categories));
  }

  useEffect(fetchAll, []);

  function openNew() {
    setForm({ name: '', description: '', active: true });
    setFile(null);
    setEditing('new');
  }

  function openEdit(cat) {
    setForm({ name: cat.name, description: cat.description || '', active: cat.active });
    setFile(null);
    setEditing(cat);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('active', form.active);
    if (file) fd.append('image', file);

    if (editing === 'new') {
      await api.post('/admin/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.put(`/admin/categories/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    setEditing(null);
    fetchAll();
  }

  async function handleDelete(cat) {
    if (!confirm(`Delete "${cat.name}"? Categories with products will be deactivated instead.`)) return;
    await api.delete(`/admin/categories/${cat.id}`);
    fetchAll();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-mist">Categories</h1>
        <button onClick={openNew} className="btn-primary"><Plus size={16} /> Add Category</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="card-surface p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-lg bg-ink-softer">
                {cat.image && <img src={imageUrl(cat.image)} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-mist">{cat.name}</p>
                <p className="text-xs text-mist-dim">{cat._count?.products ?? 0} products</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${cat.active ? 'bg-green-500/15 text-green-400' : 'bg-ink-softer text-mist-dim'}`}>
                {cat.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(cat)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-line text-mist-dim hover:text-signal">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(cat)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-line text-mist-dim hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="card-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display font-semibold text-mist">{editing === 'new' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-mist-dim" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" className="input-field" required />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input-field" rows={3} />
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input-field" />
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
