import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import api from '../api/axios.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data.settings)).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-ink-line bg-ink-soft">
      <div className="container-shop grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-display text-lg font-semibold text-mist">{settings?.storeName || 'NABIL HMZ E-COMMERCE'}</span>
          <p className="mt-3 text-sm text-mist-dim">
            {settings?.description || 'Phones, kids, gifts, perfumes, school, beauty and electronics — all in one store.'}
          </p>
          <div className="mt-4 flex gap-3">
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-ink-line hover:border-signal">
                <Facebook size={16} />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-ink-line hover:border-signal">
                <Instagram size={16} />
              </a>
            )}
            {settings?.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-ink-line hover:border-signal">
                <MessageCircle size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-mist">{t('footer_shop')}</h4>
          <ul className="mt-3 space-y-2 text-sm text-mist-dim">
            <li><Link to="/products" className="hover:text-mist">{t('nav_products')}</Link></li>
            <li><Link to="/promotions" className="hover:text-mist">{t('nav_promotions')}</Link></li>
            <li><Link to="/cart" className="hover:text-mist">{t('cart_title')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-mist">{t('footer_support')}</h4>
          <ul className="mt-3 space-y-2 text-sm text-mist-dim">
            <li><Link to="/delivery" className="hover:text-mist">{t('nav_delivery')}</Link></li>
            <li><Link to="/contact" className="hover:text-mist">{t('nav_contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-mist">{t('footer_contact')}</h4>
          <ul className="mt-3 space-y-2 text-sm text-mist-dim">
            {settings?.phone && <li>{settings.phone}</li>}
            {settings?.email && <li>{settings.email}</li>}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-line py-6 text-center text-xs text-mist-dim">
        © {new Date().getFullYear()} {settings?.storeName || 'NABIL HMZ E-COMMERCE'}. {t('all_rights_reserved')}
      </div>
    </footer>
  );
}
