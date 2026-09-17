import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductGridSkeleton from '../components/ProductGridSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState(null);

  useEffect(() => {
    setProducts(null);
    api.get(`/categories/${slug}`).then((res) => setCategory(res.data.category)).catch(() => setCategory(false));
    api.get('/products', { params: { category: slug, limit: 24 } }).then((res) => setProducts(res.data.products));
  }, [slug]);

  if (category === false) {
    return (
      <div className="container-shop py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-mist">Category not found</h1>
        <Link to="/products" className="mt-4 inline-block text-signal">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-10">
      <h1 className="font-display text-3xl font-semibold text-mist">{category?.name || '...'}</h1>
      {category?.description && <p className="mt-2 max-w-2xl text-mist-dim">{category.description}</p>}

      <div className="mt-8">
        {products === null ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No products in this category yet" description="Check back soon — new items are added regularly." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
