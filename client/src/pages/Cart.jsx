import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { imageUrl } from '../api/axios.js';
import EmptyState from '../components/EmptyState.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="container-shop py-16">
        <EmptyState
          icon={ShoppingBag}
          title={t('cart_empty_title')}
          description={t('cart_empty_desc')}
          action={<Link to="/products" className="btn-primary">{t('start_shopping')}</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-shop py-10">
      <h1 className="font-display text-3xl font-semibold text-mist">{t('cart_title')}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-surface flex gap-4 p-4"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-softer">
                  <img src={imageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${item.slug}`} className="font-medium text-mist hover:text-signal">
                        {item.name}
                      </Link>
                      {item.colorName && <p className="text-sm text-mist-dim">Color: {item.colorName}</p>}
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-mist-dim hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-ink-line">
                      <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="grid h-8 w-8 place-items-center text-mist-dim hover:text-mist">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="grid h-8 w-8 place-items-center text-mist-dim hover:text-mist">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-display font-semibold text-mist">{item.unitPrice * item.quantity} DA</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button onClick={clearCart} className="text-sm text-mist-dim hover:text-red-400">
            Clear cart
          </button>
        </div>

        <div className="card-surface h-fit p-6">
          <h2 className="font-display text-lg font-semibold text-mist">{t('order_summary')}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-mist-dim">
              <span>{t('subtotal')}</span>
              <span className="text-mist">{subtotal} DA</span>
            </div>
            <div className="flex justify-between text-mist-dim">
              <span>{t('delivery')}</span>
              <span className="text-mist">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-ink-line pt-4 font-display text-lg font-semibold text-mist">
            <span>{t('total')}</span>
            <span>{subtotal} DA</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
            {t('proceed_checkout')}
          </button>
        </div>
      </div>
    </div>
  );
}
