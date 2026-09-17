import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios.js';

export default function AdminColors() {
  const [colors, setColors] = useState([]);
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#000000');

  function fetchAll() {
    api.get('/admin/colors').then((res) => setColors(res.data.colors));
  }
  useEffect(fetchAll, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name) return;
    await api.post('/admin/colors', { name, hexCode });
    setName('');
    setHexCode('#000000');
    fetchAll();
  }

  async function toggleActive(color) {
    await api.put(`/admin/colors/${color.id}`, { active: !color.active });
    fetchAll();
  }

  async function handleDelete(color) {
    if (!confirm(`Delete "${color.name}"? Colors in use will be deactivated instead.`)) return;
    await api.delete(`/admin/colors/${color.id}`);
    fetchAll();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-mist">Colors</h1>

      <form onSubmit={handleAdd} className="card-surface mb-6 flex flex-wrap items-end gap-4 p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Black" className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">Hex Code</label>
          <input type="color" value={hexCode} onChange={(e) => setHexCode(e.target.value)} className="h-11 w-16 rounded-lg border border-ink-line bg-ink-softer" />
        </div>
        <button type="submit" className="btn-primary"><Plus size={16} /> Add Color</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((c) => (
          <div key={c.id} className="card-surface flex items-center gap-3 p-4">
            <span className="h-8 w-8 rounded-full border border-ink-line" style={{ backgroundColor: c.hexCode }} />
            <div className="flex-1">
              <p className="text-mist">{c.name}</p>
              <p className="text-xs text-mist-dim">{c.hexCode}</p>
            </div>
            <button onClick={() => toggleActive(c)} className={`rounded-full px-2 py-1 text-xs ${c.active ? 'bg-green-500/15 text-green-400' : 'bg-ink-softer text-mist-dim'}`}>
              {c.active ? 'Active' : 'Inactive'}
            </button>
            <button onClick={() => handleDelete(c)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-line text-mist-dim hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
