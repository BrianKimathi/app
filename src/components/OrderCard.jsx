import { useState } from 'react'
import { ChevronDown, ChevronUp, Package, Clock, MapPin } from 'lucide-react'
import { formatCurrency, formatDateTime, formatRelativeTime } from '../utils/formatters'
import { ORDER_STATUSES } from '../utils/constants'

export default function OrderCard({ order, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const statusInfo = ORDER_STATUSES.find(s => s.value === order.status) || ORDER_STATUSES[0]

  async function handleStatusChange(newStatus) {
    if (!onUpdateStatus) return
    setUpdating(true)
    try {
      await onUpdateStatus(order.id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  const nextStatus = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'completed'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-ink">
                Order #{order.id?.slice(-6).toUpperCase()}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeTime(order.createdAt)} · {formatDateTime(order.createdAt)}
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Customer */}
        {order.customerName && (
          <p className="text-sm text-gray-600 mb-2">{order.customerName}</p>
        )}
        {order.customerPhone && (
          <p className="text-xs text-gray-400 mb-2">{order.customerPhone}</p>
        )}

        {/* Items summary */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm font-bold text-ink">
            {formatCurrency(order.total)}
          </p>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Less details' : 'More details'}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.productName}
                </span>
                <span className="text-gray-700 font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}

            {order.note && (
              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                Note: {order.note}
              </div>
            )}

            {order.deliveryAddress && (
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {onUpdateStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            {nextStatus[order.status] && (
              <button
                onClick={() => handleStatusChange(nextStatus[order.status])}
                disabled={updating}
                className="flex-1 py-2 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                           text-white rounded-lg text-xs font-medium transition-colors"
              >
                {updating ? 'Updating...' : `Mark as ${statusInfo.label}`}
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
                className="px-3 py-2 border border-red-200 text-red-500 rounded-lg text-xs font-medium
                           hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
