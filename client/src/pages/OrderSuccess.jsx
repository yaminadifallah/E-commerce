import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import api from '../api/axios.js';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${orderNumber}`).then((res) => setOrder(res.data.order)).catch(() => setOrder(false));
  }, [orderNumber]);

  return (
    <div className="container-shop flex flex-col items-center py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-green-500/15 text-green-400"
      >
        <CheckCircle2 size={40} />
      </motion.div>

      <h1 className="mt-6 font-display text-3xl font-semibold text-mist">Order Placed Successfully!</h1>
      <p className="mt-2 text-mist-dim">Your order number is</p>
      <p className="mt-1 font-display text-2xl font-semibold text-signal">{orderNumber}</p>

      {order && (
        <div className="card-surface mt-10 w-full max-w-md p-6 text-left">
          <h2 className="mb-3 font-display font-semibold text-mist">Order Details</h2>
          <div className="space-y-1.5 text-sm text-mist-dim">
            <p>Customer: <span className="text-mist">{order.customerName}</span></p>
            <p>Phone: <span className="text-mist">{order.customerPhone}</span></p>
            <p>Delivery to: <span className="text-mist">{order.wilaya?.name}</span></p>
            <p>Status: <span className="text-mist">{order.status}</span></p>
            <div className="mt-3 border-t border-ink-line pt-3 flex justify-between font-display text-lg font-semibold text-mist">
              <span>Total</span>
              <span>{order.total} DA</span>
            </div>
          </div>
        </div>
      )}

      <Link to="/products" className="btn-primary mt-10">Continue Shopping</Link>
    </div>
  );
}
