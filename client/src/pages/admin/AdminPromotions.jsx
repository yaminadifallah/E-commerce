import { useEffect, useState, useCallback } from 'react';
import { Tag, X, Check, Search } from 'lucide-react';
import api, { imageUrl } from '../../api/axios.js';

export default function AdminPromotions() {
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState('');
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = useCallback(() => {
    const params = { limit: 50, q };
    if (onlyPromo) params.promo = 'true';
    api.get('/admin/products', { params }).then((res) => setProducts(res.data.products));
  }, [q, onlyPromo]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 250);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  function startEdit(product) {
    setEditingId(product.id);
    setDraftPrice(product.promotionPrice || '');
    setError('');
  }

  async function saveEdit(product) {
    setError('');
    try {
      await api.put(`/admin/products/${product.id}/promotion`, { promotionPrice: draftPrice || null });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update promotion.');
    }
  }

  async function clearPromotion(product) {
    await api.put(`/admin/products/${product.id}/promotion`, { promotionPrice: null });
    fetchProducts();
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-amber/15 text-amber">
          <Tag size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-mist">Promotions</h1>
          <p className="text-sm text-mist-dim">Set or remove a discounted price for any product.</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-dim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="input-field w-64 pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-mist-dim">
          <input type="checkbox" checked={onlyPromo} onChange={(e) => setOnlyPromo(e.target.checked)} />
          Active promotions only
        </label>
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {products === null ? (
        <p className="text-mist-dim">Loading...</p>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-softer text-mist-dim">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Regular Price</th>
                <th className="px-4 py-3">Promotion Price</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isEditing = editingId === p.id;
                const discount = p.promotionPrice ? Math.round((1 - p.promotionPrice / p.price) * 100) : null;
                return (
                  <tr key={p.id} className="border-t border-ink-line">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={imageUrl(p.images[0]?.url)} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        <span className="text-mist">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-mist-dim">{p.price} DA</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          autoFocus
                          value={draftPrice}
                          onChange={(e) => setDraftPrice(e.target.value)}
                          className="input-field w-28 py-1.5 text-sm"
                          placeholder="Price"
                        />
                      ) : p.promotionPrice ? (
                        <span className="text-amber">{p.promotionPrice} DA</span>
                      ) : (
                        <span className="text-mist-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {discount ? (
                        <span className="rounded-full bg-amber/15 px-2 py-0.5 text-xs font-semibold text-amber">-{discount}%</span>
                      ) : (
                        <span className="text-mist-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-line text-green-400 hover:border-green-400">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-line text-mist-dim hover:text-red-400">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(p)} className="rounded-lg border border-ink-line px-3 py-1.5 text-xs font-medium text-signal hover:border-signal">
                              {p.promotionPrice ? 'Edit' : 'Set Promotion'}
                            </button>
                            {p.promotionPrice && (
                              <button onClick={() => clearPromotion(p)} className="rounded-lg border border-ink-line px-3 py-1.5 text-xs font-medium text-mist-dim hover:text-red-400">
                                Remove
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
