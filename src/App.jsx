import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ShiftProvider } from './contexts/ShiftContext'
import { NotificationProvider } from './contexts/NotificationContext'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PosPage from './pages/PosPage'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'
import OrdersPage from './pages/OrdersPage'
import UsersPage from './pages/UsersPage'
import SuppliersPage from './pages/SuppliersPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage'
import ShiftsPage from './pages/ShiftsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route element={
              <ProtectedRoute>
                <ShiftProvider>
                  <Layout />
                </ShiftProvider>
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/shifts" element={<ShiftsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  )
}
