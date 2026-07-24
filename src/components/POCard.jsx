import { useState } from 'react'
import { ref, update, runTransaction } from 'firebase/database'
import { db } from '../firebase'
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'
import { useNotification } from '../contexts/NotificationContext'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: Clock },
  ordered: { label: 'Ordered', color: 'bg-blue-100 text-blue-700', icon: Truck },
  received: { label: 'Received', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export default function POCard({ po, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { notify } = useNotification()
  const status = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft
  const StatusIcon = status.icon

  async function handleStatusChange(newStatus) {
    setUpdating(true)
    try {
      const updates = { status: newStatus }
      if (newStatus === 'ordered') updates.orderedAt = Date.now()
      if (newStatus === 'received') updates.receivedAt = Date.now()
      await update(ref(db, `wine/purchaseOrders/${po.id}`), updates)

      // If received, increment stock
      if (newStatus === 'received' && po.items) {
        const stockUpdates = {}
        for (const item of po.items) {
          if (item.productId) {
            stockUpdates[`products/${item.productId}/stock`] = runTransaction(
              (current) => (current || 0) + item.quantity
            )
          }
        }
        // Use a simpler approach: read current, update
        for (const item of po.items) {
          if (item.productId) {
            const snap = await ref(db, `wine/products/${item.productId}/stock`).once('value')
            const currentStock = snap.val() || 0
            await update(ref(db, `wine/products/${item.productId}`), {
              stock: currentStock + item.quantity
            })
          }
        }
        notify('Stock updated from purchase order', 'success')
      }
      notify(`PO marked as ${newStatus}`, 'success')
      if (onUpdate) onUpdate()
    } catch (err) {
      notify('Failed to update PO', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const nextAction = po.status === 'draft' ? 'ordered' :
                     po.status === 'ordered' ? 'received' : null

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-ink">
              PO-{po.id?.slice(-6).toUpperCase()}
            </h3>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-1">{po.supplierName || 'Unknown Supplier'}</p>
        <p className="text-xs text-gray-400 mb-3">
          {po.createdAt ? formatDate(po.createdAt) : '—'} · {po.items?.length || 0} item{(po.items?.length || 0) !== 1 ? 's' : ''}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-ink">{formatCurrency(po.totalCost || 0)}</p>
          <button onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Details
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {po.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.totalCost || item.quantity * item.unitCost)}</span>
              </div>
            ))}
          </div>
        )}

        {nextAction && po.status !== 'cancelled' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            <button onClick={() => handleStatusChange(nextAction)}
              disabled={updating}
              className="flex-1 py-2 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                         text-white rounded-lg text-xs font-medium transition-colors">
              {updating ? 'Updating...' : `Mark as ${status.label}`}
            </button>
            {po.status === 'draft' && (
              <button onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
                className="px-3 py-2 border border-red-200 text-red-500 rounded-lg text-xs font-medium
                           hover:bg-red-50 transition-colors">
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
