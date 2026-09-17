import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { imageUrl } from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const mainImage = product.images?.find((i) => i.isMain) || product.images?.[0];
  const price = product.promotionPrice ?? product.price;

  function quickAdd(e) {
    e.preventDefault();
    if (!product.inStock) return;
    // If the product has colors, send them to the detail page to choose one.
    if (product.colors && product.colors.length > 0) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    addItem(product, null, 1);
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link to={`/products/${product.slug}`} className="card-surface group block overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-ink-softer">
          <img
            src={imageUrl(mainImage?.url)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {product.discountPercent && (
            <span className="absolute left-3 top-3 rounded-full bg-amber px-2.5 py-1 text-xs font-bold text-ink">
              -{product.discountPercent}%
            </span>
          )}
          {!product.inStock && (
            <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-mist-dim">
              Out of Stock
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-mist-dim">{product.category?.name}</p>
          <h3 className="mt-1 line-clamp-1 font-medium text-mist">{product.name}</h3>

          {product.colors && product.colors.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {product.colors.slice(0, 5).map((c) => (
                <span key={c.id} className="h-4 w-4 rounded-full border border-ink-line" style={{ backgroundColor: c.hexCode }} title={c.name} />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="font-display text-lg font-semibold text-mist">{price} DA</span>
              {product.promotionPrice && (
                <span className="ml-2 text-sm text-mist-dim line-through">{product.price} DA</span>
              )}
            </div>
            <button
              onClick={quickAdd}
              disabled={!product.inStock}
              className="grid h-9 w-9 place-items-center rounded-full bg-signal/15 text-signal transition hover:bg-signal hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
