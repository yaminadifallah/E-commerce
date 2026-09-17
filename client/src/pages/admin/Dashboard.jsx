import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { Package, ClipboardList, AlertTriangle, DollarSign } from 'lucide-react';
import api from '../../api/axios.js';

const STATUS_COLORS = {
  PENDING: '#FFB020', CONFIRMED: '#6C5CE7', PREPARING: '#8B7FF0',
  SHIPPED: '#2563EB', DELIVERED: '#16A34A', CANCELLED: '#DC2626',
};

const TONE_CLASSES = {
  signal: 'bg-signal/15 text-signal',
  amber: 'bg-amber/15 text-amber',
};

function StatCard({ icon: Icon, label, value, tone = 'signal' }) {
  return (
    <div className="card-surface p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${TONE_CLASSES[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-2xl font-display font-semibold text-mist">{value}</p>
      <p className="text-sm text-mist-dim">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-mist-dim">Loading dashboard...</p>;

  const { stats, charts, recentOrders } = data;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-mist">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStock} tone="amber" />
        <StatCard icon={ClipboardList} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon={DollarSign} label="Total Sales" value={`${stats.totalSales} DA`} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ['Active', stats.activeProducts],
          ['Out of Stock', stats.outOfStock],
          ['Pending', stats.pendingOrders],
          ['Confirmed', stats.confirmedOrders],
          ['Delivered', stats.deliveredOrders],
        ].map(([label, value]) => (
          <div key={label} className="card-surface p-4">
            <p className="text-lg font-semibold text-mist">{value}</p>
            <p className="text-xs text-mist-dim">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h2 className="mb-4 font-display font-semibold text-mist">Sales Over Time (14 days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts.salesOverTime}>
              <CartesianGrid stroke="#2A2F3A" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#B7BCC9" fontSize={11} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#B7BCC9" fontSize={11} />
              <Tooltip contentStyle={{ background: '#171A21', border: '1px solid #2A2F3A' }} />
              <Line type="monotone" dataKey="total" stroke="#6C5CE7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-6">
          <h2 className="mb-4 font-display font-semibold text-mist">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.ordersByStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90}>
                {charts.ordersByStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6C5CE7'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#171A21', border: '1px solid #2A2F3A' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-6 lg:col-span-2">
          <h2 className="mb-4 font-display font-semibold text-mist">Best-Selling Products</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.bestSellingProducts} layout="vertical">
              <CartesianGrid stroke="#2A2F3A" strokeDasharray="3 3" />
              <XAxis type="number" stroke="#B7BCC9" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#B7BCC9" fontSize={11} width={160} />
              <Tooltip contentStyle={{ background: '#171A21', border: '1px solid #2A2F3A' }} />
              <Bar dataKey="quantity" fill="#6C5CE7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-display font-semibold text-mist">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-signal hover:text-signal-light">View all →</Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-softer text-mist-dim">
            <tr>
              <th className="px-5 py-2">Order #</th>
              <th className="px-5 py-2">Customer</th>
              <th className="px-5 py-2">Wilaya</th>
              <th className="px-5 py-2">Total</th>
              <th className="px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-t border-ink-line">
                <td className="px-5 py-3">
                  <Link to={`/admin/orders/${o.id}`} className="text-signal hover:text-signal-light">{o.orderNumber}</Link>
                </td>
                <td className="px-5 py-3 text-mist">{o.customerName}</td>
                <td className="px-5 py-3 text-mist-dim">{o.wilaya}</td>
                <td className="px-5 py-3 text-mist">{o.total} DA</td>
                <td className="px-5 py-3">
                  <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ background: `${STATUS_COLORS[o.status]}22`, color: STATUS_COLORS[o.status] }}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
