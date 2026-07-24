import { useState, useEffect } from 'react'
import { ref, onValue, off, update, query, orderByChild } from 'firebase/database'
import { db } from '../firebase'
import { ClipboardList, Filter } from 'lucide-react'
import OrderCard from '../components/OrderCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useNotification } from '../contexts/NotificationContext'
import { ORDER_STATUSES } from '../utils/constants'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const { notify } = useNotification()

  useEffect(() => {
    const ordersRef = query(ref(db, 'wine/orders'), orderByChild('createdAt'))
    const unsub = onValue(ordersRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      setOrders(data.reverse())
      setLoading(false)
    })
    return () => off(unsub)
  }, [])

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter)

  async function handleUpdateStatus(orderId, newStatus) {
    try {
      await update(ref(db, `wine/orders/${orderId}`), {
        status: newStatus,
        updatedAt: Date.now()
      })
      const statusLabel = ORDER_STATUSES.find(s => s.value === newStatus)?.label || newStatus
      notify(`Order marked as ${statusLabel}`, 'success')
    } catch (err) {
      notify('Failed to update order', 'error')
    }
  }

  if (loading) return <LoadingSpinner message="Loading orders..." />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
          >
            <option value="all">All Orders</option>
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100">
          <ClipboardList size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">
            {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
          </p>
          <p className="text-xs mt-1">
            {statusFilter === 'all'
              ? 'Customer orders from the mobile app will appear here'
              : 'No orders match this status'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}
