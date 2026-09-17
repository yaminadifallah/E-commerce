import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../api/axios.js';
import { imageUrl } from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductGridSkeleton from '../components/ProductGridSkeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
    api.get('/products/featured').then((res) => setFeatured(res.data.products));
  }, []);

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-ink-line">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-signal/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-amber/10 blur-3xl" />

        <div className="container-shop relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-line px-3 py-1 text-xs font-medium text-signal">
              <Sparkles size={14} /> {t('hero_badge')}
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-mist sm:text-5xl lg:text-6xl">
              {t('hero_title')}
            </h1>
            <p className="mt-5 max-w-md text-lg text-mist-dim">
              {t('hero_subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary">
                {t('hero_shop_now')} <ArrowRight size={16} />
              </Link>
              <Link to="/promotions" className="btn-secondary">
                {t('hero_view_promotions')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mx-auto aspect-square w-full max-w-md rounded-[2rem] border border-ink-line bg-gradient-to-br from-ink-soft to-ink-softer shadow-glow"
          >
            <div className="absolute inset-6 rounded-[1.5rem] border border-signal/30 bg-ink/40" />
            <div className="absolute inset-0 grid place-items-center font-display text-mist-dim">
              <Sparkles size={64} className="text-signal/40" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- TRUST STRIP ---------------- */}
      <section className="border-b border-ink-line bg-ink-soft">
        <div className="container-shop grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: t('trust_delivery_title'), desc: t('trust_delivery_desc') },
            { icon: ShieldCheck, title: t('trust_quality_title'), desc: t('trust_quality_desc') },
            { icon: Sparkles, title: t('trust_promo_title'), desc: t('trust_promo_desc') },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
                <f.icon size={20} />
              </div>
              <div>
                <p className="font-medium text-mist">{f.title}</p>
                <p className="text-sm text-mist-dim">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="container-shop py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-mist sm:text-3xl">{t('section_categories')}</h2>
          <Link to="/products" className="text-sm font-medium text-signal hover:text-signal-light">
            {t('view_all')} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="card-surface group flex flex-col items-center gap-3 p-6 text-center transition hover:border-signal"
            >
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-ink-softer text-mist-dim group-hover:text-signal">
                {cat.image ? (
                  <img src={imageUrl(cat.image)} alt={cat.name} className="h-full w-full object-cover" />
                ) : (
                  <Sparkles size={22} />
                )}
              </div>
              <div>
                <p className="font-medium text-mist">{cat.name}</p>
                <p className="text-xs text-mist-dim">{cat.productCount} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED PRODUCTS ---------------- */}
      <section className="container-shop pb-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-mist sm:text-3xl">{t('section_featured')}</h2>
          <Link to="/products" className="text-sm font-medium text-signal hover:text-signal-light">
            {t('view_all')} →
          </Link>
        </div>
        {featured === null ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
