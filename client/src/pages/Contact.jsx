import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import api from '../api/axios.js';

export default function Contact() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data.settings));
  }, []);

  return (
    <div className="container-shop py-10">
      <h1 className="font-display text-3xl font-semibold text-mist">Contact Us</h1>
      <p className="mt-2 max-w-lg text-mist-dim">
        Have a question about an order, a product, or delivery? Reach out — we're happy to help.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {settings?.phone && (
          <div className="card-surface p-6">
            <Phone size={20} className="text-signal" />
            <h3 className="mt-3 font-display font-semibold text-mist">Phone</h3>
            <p className="mt-1 text-sm text-mist-dim">{settings.phone}</p>
          </div>
        )}
        {settings?.email && (
          <div className="card-surface p-6">
            <Mail size={20} className="text-signal" />
            <h3 className="mt-3 font-display font-semibold text-mist">Email</h3>
            <p className="mt-1 text-sm text-mist-dim">{settings.email}</p>
          </div>
        )}
        {settings?.address && (
          <div className="card-surface p-6">
            <MapPin size={20} className="text-signal" />
            <h3 className="mt-3 font-display font-semibold text-mist">Address</h3>
            <p className="mt-1 text-sm text-mist-dim">{settings.address}</p>
          </div>
        )}
        {settings?.whatsapp && (
          <a
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="card-surface p-6 transition hover:border-signal"
          >
            <MessageCircle size={20} className="text-signal" />
            <h3 className="mt-3 font-display font-semibold text-mist">WhatsApp</h3>
            <p className="mt-1 text-sm text-mist-dim">Chat with us directly</p>
          </a>
        )}
      </div>
    </div>
  );
}
