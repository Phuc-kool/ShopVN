import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'

import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import CataloguePage     from './pages/user/CataloguePage'
import ProductDetailPage from './pages/user/ProductDetailPage'
import CartPage          from './pages/user/CartPage'
import CheckoutPage      from './pages/user/CheckoutPage'
import OrdersPage        from './pages/user/OrdersPage'
import PaymentReturnPage  from './pages/user/PaymentReturnPage'

import DashboardPage        from './pages/admin/DashboardPage'
import ManageProductsPage   from './pages/admin/ManageProductsPage'
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage'
import ManageOrdersPage     from './pages/admin/ManageOrdersPage'

export default function App() {
  return (
    <Routes>
      {}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {}
      <Route path="/" element={
        <ProtectedRoute><CataloguePage /></ProtectedRoute>
      } />
      <Route path="/products/:id" element={
        <ProtectedRoute><ProductDetailPage /></ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute><CartPage /></ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute><CheckoutPage /></ProtectedRoute>
      } />
      <Route path="/order/payment-return" element={
        <ProtectedRoute><PaymentReturnPage /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute><OrdersPage /></ProtectedRoute>
      } />

      {}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute requireAdmin><ManageProductsPage /></ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute requireAdmin><ManageCategoriesPage /></ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute requireAdmin><ManageOrdersPage /></ProtectedRoute>
      } />

      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
