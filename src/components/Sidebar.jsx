import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Wine,
  Receipt,
  ClipboardList,
  Users,
  Building2,
  Package,
  Clock,
  Settings,
  LogOut,
  Store,
  Bell
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Wine },
  { to: '/sales', label: 'Sales', icon: Receipt },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/purchase-orders', label: 'Purchasing', icon: Package },
  { to: '/suppliers', label: 'Suppliers', icon: Building2 },
  { to: '/shifts', label: 'Shifts', icon: Clock },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings }
]

export default function Sidebar() {
  const { logout } = useAuth()
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    const prodRef = ref(db, 'wine/products')
    const unsub = onValue(prodRef, (snap) => {
      let count = 0
      snap.forEach(child => {
        const stock = child.val()?.stock
        if (stock != null && stock > 0 && stock <= 5) count++
      })
      setLowStockCount(count)
    })
    return () => off(unsub)
  }, [])

  return (
    <aside className="w-64 bg-gradient-wine text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-lg">
            <Store size={24} className="text-cream" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">Cellar &</h1>
            <h1 className="font-display text-lg font-bold leading-tight">Spirits</h1>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <item.icon size={20} />
            <span className="flex-1">{item.label}</span>
            {/* Low stock badge on Products */}
            {item.to === '/products' && lowStockCount > 0 && (
              <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {lowStockCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-white/70 hover:text-white hover:bg-white/10 w-full transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  )
}
