import { useState, useEffect } from 'react'
import { ref, onValue, off, update, query, orderByChild } from 'firebase/database'
import { db } from '../firebase'
import { DollarSign, TrendingUp, ShoppingBag, Download } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import SalesTable from '../components/SalesTable'
import { formatCurrency, getPeriodDateRange } from '../utils/formatters'
import { PERIODS } from '../utils/constants'
import { useNotification } from '../contexts/NotificationContext'
import { downloadSalesReport } from '../utils/reports'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')
  const { notify } = useNotification()

  useEffect(() => {
    const salesRef = query(ref(db, 'wine/sales'), orderByChild('createdAt'))
    const unsub = onValue(salesRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      setSales(data.reverse())
      setLoading(false)
    })
    return () => off(unsub)
  }, [])

  const { rangeSales } = getFilteredSales(sales, period)
  const totalRevenue = rangeSales.reduce((sum, s) => sum + (s.grandTotal || s.total || 0), 0)
  const totalItems = rangeSales.reduce((sum, s) => {
    return sum + (s.items || []).reduce((a, i) => a + i.quantity, 0)
  }, 0)
  const avgSale = rangeSales.length > 0 ? totalRevenue / rangeSales.length : 0

  async function handleRefund(sale) {
    if (!window.confirm(`Refund sale #${sale.id?.slice(-6).toUpperCase()}? This will not restore stock.`)) return
    try {
      await update(ref(db, `wine/sales/${sale.id}`), {
        status: 'refunded',
        refundedAt: Date.now()
      })
      notify('Sale refunded', 'success')
    } catch (err) {
      notify('Failed to refund sale', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sales</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {rangeSales.length} sale{rangeSales.length !== 1 ? 's' : ''} in selected period
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              downloadSalesReport(rangeSales, period)
              notify('Sales report downloaded', 'success')
            }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white
                       text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            disabled={rangeSales.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p.value
                    ? 'bg-wine-600 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={DollarSign} label="Revenue" value={formatCurrency(totalRevenue)} color="green" />
        <StatsCard icon={ShoppingBag} label="Items Sold" value={totalItems} color="blue" />
        <StatsCard icon={TrendingUp} label="Avg Sale" value={formatCurrency(avgSale)} color="purple" />
      </div>

      <SalesTable
        sales={rangeSales}
        loading={loading}
        onRefund={handleRefund}
      />
    </div>
  )
}

function getFilteredSales(sales, period) {
  const { start, end } = getPeriodDateRange(period)
  const rangeSales = sales.filter(s => {
    const d = s.createdAt ? (s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt)) : new Date(0)
    return d >= start && d <= end
  })
  return { rangeSales }
}
