import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import { AlertTriangle, Package, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LowStockBanner() {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const prodRef = ref(db, 'wine/products')
    const unsub = onValue(prodRef, (snap) => {
      const data = []
      snap.forEach(child => {
        const p = { id: child.key, ...child.val() }
        if (p.stock != null && p.stock > 0 && p.stock <= 5 && p.isActive !== false) {
          data.push(p)
        }
      })
      data.sort((a, b) => a.stock - b.stock)
      setLowStockProducts(data)
    })
    return () => off(unsub)
  }, [])

  if (dismissed || lowStockProducts.length === 0) return null

  const critical = lowStockProducts.filter(p => p.stock <= 2)
  const warning = lowStockProducts.filter(p => p.stock > 2)

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 relative">
      <button onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 text-amber-400 hover:text-amber-600">
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-lg">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">
            {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            Stock levels are below 5 units. Consider placing a purchase order.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {critical.slice(0, 5).map(p => (
              <Link key={p.id} to="/products"
                className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium
                           hover:bg-red-200 transition-colors">
                <Package size={12} />
                {p.name} ({p.stock})
              </Link>
            ))}
            {warning.slice(0, 5 - critical.length).map(p => (
              <Link key={p.id} to="/products"
                className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium
                           hover:bg-amber-200 transition-colors">
                <Package size={12} />
                {p.name} ({p.stock})
              </Link>
            ))}
            {lowStockProducts.length > 5 && (
              <Link to="/products"
                className="text-amber-600 text-xs font-medium hover:text-amber-700 underline">
                +{lowStockProducts.length - 5} more
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
