import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/axios.js';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [wilayas, setWilayas] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    wilayaId: '',
    deliveryOfficeId: '',
    address: '',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    api.get('/wilayas').then((res) => setWilayas(res.data.wilayas));
  }, []);

  useEffect(() => {
    if (!form.wilayaId) {
      setOffices([]);
      setSelectedWilaya(null);
      return;
    }
    api.get(`/wilayas/${form.wilayaId}/offices`).then((res) => {
      setSelectedWilaya(res.data.wilaya);
      setOffices(res.data.offices);
    });
  }, [form.wilayaId]);

  if (items.length === 0) {
    return (
      <div className="container-shop py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-mist">Your cart is empty</h1>
        <Link to="/products" className="mt-4 inline-block text-signal">Go shopping</Link>
      </div>
    );
  }

  function validate() {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Full name is required.';
    if (!/^(?:\+213|0)(5|6|7)[0-9]{8}$/.test(form.customerPhone.replace(/\s|-/g, ''))) {
      errs.customerPhone = 'Enter a valid Algerian phone number (e.g. 0555 12 34 56).';
    }
    if (!form.wilayaId) errs.wilayaId = 'Please select your wilaya.';
    if (!form.address.trim()) errs.address = 'Delivery address is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        ...form,
        wilayaId: parseInt(form.wilayaId, 10),
        deliveryOfficeId: form.deliveryOfficeId ? parseInt(form.deliveryOfficeId, 10) : null,
        items: items.map((i) => ({ productId: i.productId, colorName: i.colorName, quantity: i.quantity })),
      };
      const res = await api.post('/orders', payload);
      clearCart();
      navigate(`/order-success/${res.data.orderNumber}`);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const deliveryPrice = selectedWilaya ? selectedWilaya.deliveryPrice : 0;
  const total = subtotal + deliveryPrice;

  return (
    <div className="container-shop py-10">
      <h1 className="font-display text-3xl font-semibold text-mist">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="card-surface space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Full name</label>
            <input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="input-field"
              placeholder="Your full name"
            />
            {errors.customerName && <p className="mt-1 text-xs text-red-400">{errors.customerName}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Phone number</label>
            <input
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="input-field"
              placeholder="05XX XX XX XX"
            />
            {errors.customerPhone && <p className="mt-1 text-xs text-red-400">{errors.customerPhone}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist">Wilaya</label>
              <select
                value={form.wilayaId}
                onChange={(e) => setForm({ ...form, wilayaId: e.target.value, deliveryOfficeId: '' })}
                className="input-field"
              >
                <option value="">Select wilaya</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{w.code} — {w.name}</option>
                ))}
              </select>
              {errors.wilayaId && <p className="mt-1 text-xs text-red-400">{errors.wilayaId}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-mist">Delivery office (optional)</label>
              <select
                value={form.deliveryOfficeId}
                onChange={(e) => setForm({ ...form, deliveryOfficeId: e.target.value })}
                className="input-field"
                disabled={offices.length === 0}
              >
                <option value="">Home delivery</option>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedWilaya && (
            <div className="rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-mist">
              Delivery to <strong className="text-mist">{selectedWilaya.name}</strong>: {selectedWilaya.deliveryPrice} DA
              — estimated {selectedWilaya.estimatedDays} day{selectedWilaya.estimatedDays > 1 ? 's' : ''}.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Delivery address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Street, building, floor, landmark..."
            />
            {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-mist">Note (optional)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Anything we should know about your order?"
            />
          </div>

          {submitError && <p className="text-sm text-red-400">{submitError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? 'Placing order...' : 'Confirm Order'}
          </button>
        </form>

        <div className="card-surface h-fit p-6">
          <h2 className="font-display text-lg font-semibold text-mist">Order Summary</h2>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={item.key} className="flex justify-between text-sm">
                <div>
                  <p className="text-mist">{item.name} × {item.quantity}</p>
                  {item.colorName && <p className="text-xs text-mist-dim">{item.colorName}</p>}
                </div>
                <span className="text-mist-dim">{item.unitPrice * item.quantity} DA</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-ink-line pt-4 text-sm">
            <div className="flex justify-between text-mist-dim">
              <span>Subtotal</span>
              <span className="text-mist">{subtotal} DA</span>
            </div>
            <div className="flex justify-between text-mist-dim">
              <span>Delivery</span>
              <span className="text-mist">{deliveryPrice} DA</span>
            </div>
            <div className="flex justify-between border-t border-ink-line pt-2 font-display text-lg font-semibold text-mist">
              <span>Total</span>
              <span>{total} DA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
