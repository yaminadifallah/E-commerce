import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, PackageSearch, Upload } from 'lucide-react';
import api, { imageUrl } from '../../api/axios.js';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(() => {
    api.get('/admin/products', { params: { q, page, limit: 15 } }).then((res) => {
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    });
  }, [q, page]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 250);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? Products used in past orders will be deactivated instead.`)) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-mist">Products</h1>
        <div className="flex gap-3">
          <Link to="/admin/products/bulk-import" className="btn-secondary">
            <Upload size={16} /> Bulk Add
          </Link>
          <Link to="/admin/products/new" className="btn-primary">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-dim" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="input-field pl-9"
        />
      </div>

      {products === null ? (
        <p className="text-mist-dim">Loading...</p>
      ) : products.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No products found" />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-softer text-mist-dim">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-ink-line">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={imageUrl(p.images[0]?.url)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="text-mist">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-mist-dim">{p.category?.name}</td>
                  <td className="px-4 py-3 text-mist">
                    {p.promotionPrice ?? p.price} DA
                    {p.promotionPrice && <span className="ml-1 text-xs text-mist-dim line-through">{p.price}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-amber' : 'text-mist-dim'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.active ? 'bg-green-500/15 text-green-400' : 'bg-ink-softer text-mist-dim'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-line text-mist-dim hover:text-signal">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-line text-mist-dim hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
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
