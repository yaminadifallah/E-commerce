import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductGridSkeleton from '../components/ProductGridSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Promotions() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    api.get('/promotions').then((res) =>
      setProducts(
        res.data.products.map((p) => ({
          ...p,
          inStock: p.stock > 0,
        }))
      )
    );
  }, []);

  return (
    <div className="container-shop py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-amber/15 text-amber">
          <Tag size={20} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-mist">Promotions</h1>
          <p className="text-sm text-mist-dim">Limited-time discounts on selected accessories.</p>
        </div>
      </div>

      {products === null ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState icon={Tag} title="No active promotions right now" description="Check back soon — we add new deals regularly." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
