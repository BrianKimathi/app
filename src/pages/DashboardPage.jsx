import { useState, useEffect, useMemo } from 'react'
import { ref, onValue, off, query, orderByChild } from 'firebase/database'
import { db } from '../firebase'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Wine,
  Download
} from 'lucide-react'
import StatsCard from '../components/StatsCard'
import SaleChart, { chartEmptyData } from '../components/SaleChart'
import LowStockBanner from '../components/LowStockBanner'
import { formatCurrency, formatRelativeTime, getPeriodDateRange } from '../utils/formatters'
import { PERIODS } from '../utils/constants'
import { downloadDashboardReport } from '../utils/reports'
import { useNotification } from '../contexts/NotificationContext'

export default function DashboardPage() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')
  const { notify } = useNotification()

  useEffect(() => {
    const salesRef = query(ref(db, 'wine/sales'), orderByChild('createdAt'))
    const salesUnsub = onValue(salesRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      setSales(data.reverse())
      setLoading(false)
    })

    const prodRef = ref(db, 'wine/products')
    const prodUnsub = onValue(prodRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      setProducts(data)
    })

    return () => {
      off(salesRef)
      off(prodRef)
    }
  }, [])

  const { rangeSales, prevRangeSales } = useMemo(() => {
    const { start, end } = getPeriodDateRange(period)
    const now = new Date()

    // Current period sales
    const current = sales.filter(s => {
      const d = s.createdAt ? (s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt)) : new Date(0)
      return d >= start && d <= end
    })

    // Previous period sales (for comparison)
    const periodMs = end - start
    const prevStart = new Date(start.getTime() - periodMs)
    const prev = sales.filter(s => {
      const d = s.createdAt ? (s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt)) : new Date(0)
      return d >= prevStart && d < start
    })

    return { rangeSales: current, prevRangeSales: prev }
  }, [sales, period])

  const totalRevenue = rangeSales.reduce((sum, s) => sum + (s.grandTotal || s.total || 0), 0)
  const prevRevenue = prevRangeSales.reduce((sum, s) => sum + (s.grandTotal || s.total || 0), 0)
  const totalTransactions = rangeSales.length
  const prevTransactions = prevRangeSales.length

  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : totalRevenue > 0 ? 100 : 0
  const transactionChange = prevTransactions > 0 ? ((totalTransactions - prevTransactions) / prevTransactions) * 100 : totalTransactions > 0 ? 100 : 0

  // Bottle vs shot breakdown
  const bottleSales = rangeSales.reduce((sum, s) => {
    return sum + (s.items || []).filter(i => i.saleType === 'bottle').reduce((a, i) => a + i.quantity, 0)
  }, 0)
  const shotSales = rangeSales.reduce((sum, s) => {
    return sum + (s.items || []).filter(i => i.saleType === 'shot').reduce((a, i) => a + i.quantity, 0)
  }, 0)

  // Top products
  const productSales = {}
  const uniqueProducts = new Set()
  rangeSales.forEach(s => {
    (s.items || []).forEach(item => {
      const key = item.productName || item.productId
      uniqueProducts.add(key)
      if (!productSales[key]) productSales[key] = 0
      productSales[key] += item.quantity
    })
  })
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Chart data — last 7 days
  const chartData = useMemo(() => {
    const days = []
    const labels = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const dayEnd = new Date(d)
      dayEnd.setHours(23, 59, 59, 999)

      const daySales = sales.filter(s => {
        const sd = s.createdAt ? (s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt)) : new Date(0)
        return sd >= d && sd <= dayEnd
      })
      const total = daySales.reduce((sum, s) => sum + (s.grandTotal || s.total || 0), 0)
      days.push(total)
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    return { data: days, labels }
  }, [sales])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your store's performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              downloadDashboardReport(rangeSales, {
                totalRevenue,
                totalTransactions,
                avgSale: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
                bottleSales,
                shotSales,
                uniqueProducts: uniqueProducts.size,
                topProducts
              }, period)
              notify('Dashboard report downloaded', 'success')
            }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white
                       text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export Report
          </button>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            {PERIODS.slice(0, 4).map(p => (
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

      {/* Low Stock Alert */}
      <LowStockBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={DollarSign}
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          subValue={revenueChange !== 0 ? `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}% vs prev ${period}` : 'No change'}
          color={revenueChange >= 0 ? 'green' : 'amber'}
        />
        <StatsCard
          icon={ShoppingCart}
          label="Transactions"
          value={totalTransactions}
          subValue={transactionChange !== 0 ? `${transactionChange > 0 ? '+' : ''}${transactionChange.toFixed(1)}% vs prev ${period}` : 'No change'}
          color="blue"
        />
        <StatsCard
          icon={Wine}
          label="Bottles Sold"
          value={bottleSales}
          subValue={`${shotSales} shots sold`}
          color="purple"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg. Sale"
          value={formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
          subValue={`${products.length} products in stock`}
          color="amber"
        />
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {chartData.data.some(v => v > 0) ? (
            <SaleChart data={chartData.data} labels={chartData.labels} title="Sales (Last 7 Days)" />
          ) : (
            chartEmptyData('Sales (Last 7 Days)')
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-5">
          <h3 className="text-sm font-semibold text-ink mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
              No sales data
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-wine-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(qty / topProducts[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{qty}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Sales */}
          <h3 className="text-sm font-semibold text-ink mt-6 mb-3">Recent Sales</h3>
          {rangeSales.length === 0 ? (
            <p className="text-sm text-gray-400">No sales in this period</p>
          ) : (
            <div className="space-y-2">
              {rangeSales.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-600 font-medium truncate max-w-[160px]">
                      {sale.items?.[0]?.productName || 'Sale'}
                      {sale.items?.length > 1 && ` +${sale.items.length - 1}`}
                    </p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(sale.createdAt)}</p>
                  </div>
                  <p className="font-semibold text-ink">
                    {formatCurrency(sale.grandTotal || sale.total || 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
