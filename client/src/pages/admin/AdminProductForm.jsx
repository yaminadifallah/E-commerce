import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Star } from 'lucide-react';
import api, { imageUrl } from '../../api/axios.js';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', promotionPrice: '', stock: '',
    categoryId: '', featured: false, active: true, colorIds: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/categories').then((res) => setCategories(res.data.categories));
    api.get('/admin/colors').then((res) => setColors(res.data.colors));
    if (isEdit) {
      api.get(`/admin/products/${id}`).then((res) => {
        const p = res.data.product;
        setForm({
          name: p.name,
          description: p.description || '',
          price: p.price,
          promotionPrice: p.promotionPrice || '',
          stock: p.stock,
          categoryId: p.categoryId,
          featured: p.featured,
          active: p.active,
          colorIds: p.colors.map((c) => c.id),
        });
        setExistingImages(p.images);
      });
    }
  }, [id, isEdit]);

  function toggleColor(colorId) {
    setForm((f) => ({
      ...f,
      colorIds: f.colorIds.includes(colorId) ? f.colorIds.filter((c) => c !== colorId) : [...f.colorIds, colorId],
    }));
  }

  async function handleDeleteImage(imageId) {
    await api.delete(`/admin/products/${id}/images/${imageId}`);
    setExistingImages((imgs) => imgs.filter((i) => i.id !== imageId));
  }

  async function handleSetMain(imageId) {
    await api.put(`/admin/products/${id}/images/${imageId}/main`);
    setExistingImages((imgs) => imgs.map((i) => ({ ...i, isMain: i.id === imageId })));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.price || !form.categoryId) {
      setError('Name, price and category are required.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      if (form.promotionPrice) fd.append('promotionPrice', form.promotionPrice);
      fd.append('stock', form.stock || 0);
      fd.append('categoryId', form.categoryId);
      fd.append('featured', form.featured);
      fd.append('active', form.active);
      fd.append('colorIds', JSON.stringify(form.colorIds));
      newFiles.forEach((file) => fd.append('images', file));

      if (isEdit) {
        await api.put(`/admin/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-display text-2xl font-semibold text-mist">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="card-surface space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={4} />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Price (DA)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Promotion Price (DA)</label>
            <input type="number" value={form.promotionPrice} onChange={(e) => setForm({ ...form, promotionPrice: e.target.value })} className="input-field" placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Stock</label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">Available Colors</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleColor(c.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${form.colorIds.includes(c.id) ? 'border-signal text-mist' : 'border-ink-line text-mist-dim'}`}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-ink-line" style={{ backgroundColor: c.hexCode }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {isEdit && existingImages.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Current Images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-ink-line">
                  <img src={imageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white">
                    <X size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetMain(img.id)}
                    className={`absolute bottom-1 left-1 grid h-5 w-5 place-items-center rounded-full ${img.isMain ? 'bg-amber text-ink' : 'bg-black/60 text-white'}`}
                    title="Set as main image"
                  >
                    <Star size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-mist">
            {isEdit ? 'Add More Images' : 'Product Images'}
          </label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setNewFiles(Array.from(e.target.files))}
            className="input-field"
          />
          <p className="mt-1 text-xs text-mist-dim">JPG, PNG or WEBP. Max 5MB each.</p>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-mist">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-mist">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
