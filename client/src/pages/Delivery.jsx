import { useEffect, useState } from 'react';
import { Truck, MapPin, Clock } from 'lucide-react';
import api from '../api/axios.js';

export default function Delivery() {
  const [wilayas, setWilayas] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/wilayas').then((res) => setWilayas(res.data.wilayas));
    api.get('/settings').then((res) => setSettings(res.data.settings));
  }, []);

  return (
    <div className="container-shop py-10">
      <div className="mb-10 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-signal/15 text-signal">
          <Truck size={20} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-mist">Delivery Information</h1>
          <p className="text-sm text-mist-dim">We deliver to all 58 wilayas of Algeria.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-6">
          <MapPin size={20} className="text-signal" />
          <h3 className="mt-3 font-display font-semibold text-mist">Home delivery</h3>
          <p className="mt-1 text-sm text-mist-dim">We deliver straight to your address in every wilaya.</p>
        </div>
        <div className="card-surface p-6">
          <Clock size={20} className="text-signal" />
          <h3 className="mt-3 font-display font-semibold text-mist">Estimated time</h3>
          <p className="mt-1 text-sm text-mist-dim">1 to 9 days depending on your wilaya — shown below and at checkout.</p>
        </div>
        <div className="card-surface p-6">
          <Truck size={20} className="text-signal" />
          <h3 className="mt-3 font-display font-semibold text-mist">Delivery offices</h3>
          <p className="mt-1 text-sm text-mist-dim">Pick up from a nearby office to save on delivery costs, where available.</p>
        </div>
      </div>

      <div className="mt-10 card-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-softer text-mist-dim">
            <tr>
              <th className="px-4 py-3">Wilaya</th>
              <th className="px-4 py-3">Delivery Price</th>
              <th className="px-4 py-3">Estimated Time</th>
            </tr>
          </thead>
          <tbody>
            {wilayas.map((w) => (
              <tr key={w.id} className="border-t border-ink-line">
                <td className="px-4 py-3 text-mist">{w.code} — {w.name}</td>
                <td className="px-4 py-3 text-mist-dim">{w.deliveryPrice} DA</td>
                <td className="px-4 py-3 text-mist-dim">{w.estimatedDays} day{w.estimatedDays > 1 ? 's' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {settings?.phone && (
        <p className="mt-8 text-sm text-mist-dim">
          Questions about your delivery? Call us at <span className="text-mist">{settings.phone}</span>.
        </p>
      )}
    </div>
  );
}
