import { useEffect, useState } from 'react';
import api, { imageUrl } from '../../api/axios.js';

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((res) => setForm(res.data.settings));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'logo' && value !== null) fd.append(key, value);
      });
      if (logoFile) fd.append('logo', logoFile);
      const res = await api.put('/admin/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(res.data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-mist-dim">Loading...</p>;

  const fields = [
    ['storeName', 'Store Name'], ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address'],
    ['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['tiktok', 'TikTok URL'], ['whatsapp', 'WhatsApp Number'],
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-semibold text-mist">Store Settings</h1>

      <form onSubmit={handleSubmit} className="card-surface space-y-5 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-lg bg-ink-softer">
            {form.logo && <img src={imageUrl(form.logo)} alt="Logo" className="h-full w-full object-cover" />}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Store Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="input-field" />
          </div>
        </div>

        {fields.map(([key, label]) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-mist">{label}</label>
            <input
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="input-field"
            />
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">Store Description</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
            rows={3}
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
