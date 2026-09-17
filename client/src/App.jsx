import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from './components/StorefrontLayout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import Promotions from './pages/Promotions.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Delivery from './pages/Delivery.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminProductForm from './pages/admin/AdminProductForm.jsx';
import AdminBulkImport from './pages/admin/AdminBulkImport.jsx';
import AdminPromotions from './pages/admin/AdminPromotions.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminColors from './pages/admin/AdminColors.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminOrderDetail from './pages/admin/AdminOrderDetail.jsx';
import AdminWilayas from './pages/admin/AdminWilayas.jsx';
import AdminDeliveryOffices from './pages/admin/AdminDeliveryOffices.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

export default function App() {
  return (
    <Routes>
      {/* ---------- Storefront ---------- */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ---------- Admin ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/bulk-import" element={<AdminBulkImport />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="colors" element={<AdminColors />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="wilayas" element={<AdminWilayas />} />
        <Route path="delivery-offices" element={<AdminDeliveryOffices />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
