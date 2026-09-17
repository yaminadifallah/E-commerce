import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductGridSkeleton from '../components/ProductGridSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
  { value: 'promotions', label: 'Promotions' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const color = params.get('color') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const inStock = params.get('inStock') || '';
  const promo = params.get('promo') || '';
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1', 10);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
    api.get('/colors').then((res) => setColors(res.data.colors));
  }, []);

  const fetchProducts = useCallback(() => {
    setProducts(null);
    const query = { q, category, color, minPrice, maxPrice, inStock, promo, sort, page, limit: 12 };
    Object.keys(query).forEach((k) => !query[k] && delete query[k]);
    api.get('/products', { params: query }).then((res) => {
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    });
  }, [q, category, color, minPrice, maxPrice, inStock, promo, sort, page]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 250); // debounce
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  }

  return (
    <div className="container-shop py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-mist">
            {q ? `Search results for "${q}"` : 'All Products'}
          </h1>
          {pagination && <p className="mt-1 text-sm text-mist-dim">{pagination.total} products found</p>}
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="btn-secondary lg:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* -------- Filters sidebar -------- */}
        <aside className={`space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div>
            <h3 className="mb-3 font-display text-sm font-semibold text-mist">Category</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => updateParam('category', '')}
                className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${!category ? 'text-signal' : 'text-mist-dim hover:text-mist'}`}
              >
                All categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${category === c.slug ? 'text-signal' : 'text-mist-dim hover:text-mist'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold text-mist">Price Range (DA)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateParam('minPrice', e.target.value)}
                className="input-field text-sm"
              />
              <span className="text-mist-dim">–</span>
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam('maxPrice', e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold text-mist">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('color', color === String(c.id) ? '' : String(c.id))}
                  title={c.name}
                  className={`h-8 w-8 rounded-full border-2 ${color === String(c.id) ? 'border-signal' : 'border-ink-line'}`}
                  style={{ backgroundColor: c.hexCode }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-mist-dim">
              <input type="checkbox" checked={inStock === 'true'} onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')} />
              In stock only
            </label>
            <label className="flex items-center gap-2 text-sm text-mist-dim">
              <input type="checkbox" checked={promo === 'true'} onChange={(e) => updateParam('promo', e.target.checked ? 'true' : '')} />
              Promotions only
            </label>
          </div>
        </aside>

        {/* -------- Product grid -------- */}
        <div>
          <div className="mb-6 flex justify-end">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input-field w-auto text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>Sort: {o.label}</option>
              ))}
            </select>
          </div>

          {products === null ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try adjusting your filters or search for something else."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`h-9 w-9 rounded-full text-sm ${page === i + 1 ? 'bg-signal text-white' : 'border border-ink-line text-mist-dim hover:text-mist'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
