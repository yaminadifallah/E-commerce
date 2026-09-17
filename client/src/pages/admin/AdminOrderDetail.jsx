import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios.js';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  function fetchOrder() {
    api.get(`/admin/orders/${id}`).then((res) => setOrder(res.data.order));
  }
  useEffect(fetchOrder, [id]);

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      const res = await api.put(`/admin/orders/${id}/status`, { status });
      setOrder(res.data.order);
    } finally {
      setUpdating(false);
    }
  }

  if (!order) return <p className="text-mist-dim">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-mist-dim hover:text-mist">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-mist">{order.orderNumber}</h1>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="input-field w-auto"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="mb-3 font-display font-semibold text-mist">Customer</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-mist-dim">Name</dt><dd className="text-mist">{order.customerName}</dd></div>
            <div className="flex justify-between"><dt className="text-mist-dim">Phone</dt><dd className="text-mist">{order.customerPhone}</dd></div>
          </dl>
        </div>

        <div className="card-surface p-5">
          <h2 className="mb-3 font-display font-semibold text-mist">Delivery</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-mist-dim">Wilaya</dt><dd className="text-mist">{order.wilaya?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-mist-dim">Office</dt><dd className="text-mist">{order.deliveryOffice?.name || 'Home delivery'}</dd></div>
            <div><dt className="text-mist-dim">Address</dt><dd className="mt-1 text-mist">{order.address}</dd></div>
            {order.note && <div><dt className="text-mist-dim">Note</dt><dd className="mt-1 text-mist">{order.note}</dd></div>}
          </dl>
        </div>
      </div>

      <div className="card-surface mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-softer text-mist-dim">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Color</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-ink-line">
                <td className="px-4 py-3 text-mist">{item.productNameSnapshot}</td>
                <td className="px-4 py-3 text-mist-dim">{item.selectedColor || '—'}</td>
                <td className="px-4 py-3 text-mist-dim">{item.quantity}</td>
                <td className="px-4 py-3 text-mist-dim">{item.unitPrice} DA</td>
                <td className="px-4 py-3 text-mist">{item.subtotal} DA</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1.5 border-t border-ink-line p-5 text-sm">
          <div className="flex justify-between text-mist-dim"><span>Subtotal</span><span className="text-mist">{order.subtotal} DA</span></div>
          <div className="flex justify-between text-mist-dim"><span>Delivery</span><span className="text-mist">{order.deliveryPrice} DA</span></div>
          <div className="flex justify-between font-display text-lg font-semibold text-mist"><span>Total</span><span>{order.total} DA</span></div>
        </div>
      </div>
    </div>
  );
}
