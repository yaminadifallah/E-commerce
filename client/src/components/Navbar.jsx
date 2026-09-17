import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X, Store, Sun, Moon, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { totalQuantity } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang, languages } = useLanguage();
  const navigate = useNavigate();

  const LINKS = [
    { to: '/', label: t('nav_home') },
    { to: '/products', label: t('nav_products') },
    { to: '/promotions', label: t('nav_promotions') },
    { to: '/delivery', label: t('nav_delivery') },
    { to: '/contact', label: t('nav_contact') },
  ];

  useEffect(() => setOpen(false), []);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/90 backdrop-blur">
      <div className="container-shop flex h-16 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-signal/15 text-signal">
            <Store size={20} />
          </span>
          <span className="font-display text-base font-semibold leading-tight text-mist sm:text-lg">
            NABIL HMZ<span className="block text-[10px] font-normal tracking-widest text-mist-dim sm:text-xs">E-COMMERCE</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-mist-dim transition hover:text-mist">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-dim rtl:left-auto rtl:right-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nav_search_placeholder')}
              className="w-48 rounded-full border border-ink-line bg-ink-soft py-2 pl-9 pr-3 text-sm text-mist placeholder:text-mist-dim focus:border-signal focus:outline-none rtl:pl-3 rtl:pr-9"
            />
          </form>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink-line text-mist-dim transition hover:border-signal hover:text-signal"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen((s) => !s)}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink-line text-mist-dim transition hover:border-signal hover:text-signal"
            >
              <Globe size={17} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-36 overflow-hidden rounded-lg border border-ink-line bg-ink-soft shadow-lg rtl:right-auto rtl:left-0"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`block w-full px-4 py-2.5 text-left text-sm rtl:text-right ${lang === l.code ? 'text-signal' : 'text-mist-dim hover:text-mist'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full border border-ink-line transition hover:border-signal">
            <ShoppingCart size={18} className="text-mist" />
            <AnimatePresence>
              {totalQuantity > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-signal text-[10px] font-bold text-white"
                >
                  {totalQuantity}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-ink-line lg:hidden">
            <Menu size={18} className="text-mist" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/95 backdrop-blur lg:hidden"
          >
            <div className="container-shop flex h-16 items-center justify-between">
              <span className="font-display text-lg font-semibold text-mist">Menu</span>
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-ink-line">
                <X size={18} className="text-mist" />
              </button>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="container-shop flex flex-col gap-1 pt-4"
            >
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-dim" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('nav_search_placeholder')}
                  className="input-field pl-9"
                />
              </form>
              {LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-lg font-medium text-mist hover:bg-ink-soft"
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
