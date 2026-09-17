import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Palette, ClipboardList,
  MapPin, Building2, Settings, LogOut, Menu, X, Store, Tag, Users, Bell, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [alerts, setAlerts] = useState({ categoriesOutOfStock: [], lowStockProducts: 0 });
  const bellRef = useRef(null);

  const LINKS = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/promotions', label: 'Promotions', icon: Tag },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/colors', label: 'Colors', icon: Palette },
    { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { to: '/admin/wilayas', label: 'Wilayas', icon: MapPin },
    { to: '/admin/delivery-offices', label: 'Delivery Offices', icon: Building2 },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin/users', label: 'Staff & Activity', icon: Users }] : []),
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    function fetchAlerts() {
      api.get('/admin/dashboard/alerts').then((res) => setAlerts(res.data)).catch(() => {});
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  const alertCount = alerts.categoriesOutOfStock.length;

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-signal/15 text-signal">
          <Store size={18} />
        </span>
        <span className="font-display text-sm font-semibold leading-tight text-mist">
          NABIL HMZ<span className="block text-[10px] font-normal text-mist-dim">Admin Panel</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-signal/15 text-signal' : 'text-mist-dim hover:bg-ink-softer hover:text-mist'
              }`
            }
          >
            <link.icon size={17} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-line p-4">
        <p className="px-1 text-xs text-mist-dim">Signed in as</p>
        <p className="px-1 text-sm font-medium text-mist">{user?.name} <span className="text-mist-dim">({user?.role})</span></p>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-mist-dim hover:bg-ink-softer hover:text-red-400"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ink text-mist">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-line bg-ink-soft lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-64 flex-col bg-ink-soft">{SidebarContent}</div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-ink-line px-5">
          <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-ink-line lg:hidden">
            <Menu size={16} />
          </button>
          <span className="font-display font-semibold text-mist lg:hidden">Admin Panel</span>
          <div className="ml-auto flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen((s) => !s)}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-ink-line text-mist-dim hover:border-signal hover:text-signal"
              >
                <Bell size={17} />
                {alertCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-ink-line bg-ink-soft shadow-lg">
                  <div className="border-b border-ink-line px-4 py-3">
                    <p className="text-sm font-semibold text-mist">Alerts</p>
                  </div>
                  {alertCount === 0 && alerts.lowStockProducts === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-mist-dim">No alerts right now.</p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {alerts.categoriesOutOfStock.map((c) => (
                        <Link
                          key={c.id}
                          to={`/admin/products?category=${c.id}`}
                          onClick={() => setBellOpen(false)}
                          className="flex items-start gap-3 border-b border-ink-line px-4 py-3 hover:bg-ink-softer"
                        >
                          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
                          <div>
                            <p className="text-sm text-mist">Category out of stock</p>
                            <p className="text-xs text-mist-dim">All products in "{c.name}" are out of stock.</p>
                          </div>
                        </Link>
                      ))}
                      {alerts.lowStockProducts > 0 && (
                        <Link
                          to="/admin/products"
                          onClick={() => setBellOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-ink-softer"
                        >
                          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber" />
                          <div>
                            <p className="text-sm text-mist">Low stock</p>
                            <p className="text-xs text-mist-dim">{alerts.lowStockProducts} product(s) have 5 or fewer left.</p>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
