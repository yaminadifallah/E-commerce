import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import api, { imageUrl } from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductGridSkeleton from '../components/ProductGridSkeleton.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setSelectedColor(null);
    setActiveImage(0);
    setQuantity(1);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.product);
        setRelated(res.data.related);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="container-shop py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-mist">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-signal">Back to products</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-shop py-10">
        <ProductGridSkeleton count={1} />
      </div>
    );
  }

  function handleAddToCart() {
    if (product.colors.length > 0 && !selectedColor) {
      setError('Please select a color before adding to cart.');
      return;
    }
    setError('');
    addItem(product, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const images = product.images.length > 0 ? product.images : [{ url: null }];

  return (
    <div className="container-shop py-10">
      <nav className="mb-6 text-sm text-mist-dim">
        <Link to="/products" className="hover:text-mist">Products</Link>
        {product.category && (
          <>
            {' / '}
            <Link to={`/categories/${product.category.slug}`} className="hover:text-mist">{product.category.name}</Link>
          </>
        )}
        {' / '}
        <span className="text-mist">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* -------- Gallery -------- */}
        <div>
          <div className="aspect-square overflow-hidden rounded-card border border-ink-line bg-ink-softer">
            <img src={imageUrl(images[activeImage]?.url)} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === idx ? 'border-signal' : 'border-ink-line'}`}
                >
                  <img src={imageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* -------- Info -------- */}
        <div>
          <p className="text-xs uppercase tracking-wide text-signal">{product.category?.name}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-mist">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-mist">
              {product.promotionPrice ?? product.price} DA
            </span>
            {product.promotionPrice && (
              <>
                <span className="text-lg text-mist-dim line-through">{product.price} DA</span>
                <span className="rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-ink">-{product.discountPercent}%</span>
              </>
            )}
          </div>

          <p className="mt-2 text-sm">
            {product.inStock ? (
              <span className="text-green-400">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-400">Out of stock</span>
            )}
          </p>

          {product.description && <p className="mt-5 leading-relaxed text-mist-dim">{product.description}</p>}

          {product.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-mist">
                Color{selectedColor ? `: ${selectedColor}` : ''}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedColor(c.name); setError(''); }}
                    title={c.name}
                    className={`h-9 w-9 rounded-full border-2 transition ${selectedColor === c.name ? 'border-signal scale-110' : 'border-ink-line'}`}
                    style={{ backgroundColor: c.hexCode }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-ink-line">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-mist-dim hover:text-mist">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="grid h-10 w-10 place-items-center text-mist-dim hover:text-mist"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <Check size={16} /> Added to cart
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <ShoppingCart size={16} /> Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-semibold text-mist">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
