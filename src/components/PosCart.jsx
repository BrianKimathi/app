import { useState } from 'react'
import { Trash2, Minus, Plus, ShoppingBag, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { PAYMENT_METHODS } from '../utils/constants'
import { useCart } from '../contexts/CartContext'

export default function PosCart({ onCheckout, processing }) {
  const {
    items, paymentMethod, note, itemCount, subtotal, grandTotal,
    updateQuantity, removeItem, setPaymentMethod, setNote, clearCart
  } = useCart()

  const [confirmClear, setConfirmClear] = useState(false)

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-6 h-full
                      flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium text-sm">Cart is empty</p>
        <p className="text-gray-400 text-xs mt-1">Tap a product to add it</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Current Sale</p>
          <p className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
        {confirmClear ? (
          <div className="flex gap-1">
            <button
              onClick={() => { clearCart(); setConfirmClear(false) }}
              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded font-medium hover:bg-red-100"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map(item => (
          <div key={`${item.productId}-${item.saleType}`}
               className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{item.productName}</p>
              <p className="text-xs text-gray-400">
                {item.saleType === 'shot' ? 'Shot' : 'Bottle'} · {formatCurrency(item.unitPrice)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.saleType, item.quantity - 1)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <Minus size={14} className="text-gray-500" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.saleType, item.quantity + 1)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                disabled={item.stock != null && item.quantity >= item.stock}
              >
                <Plus size={14} className={`${item.stock != null && item.quantity >= item.stock ? 'text-gray-300' : 'text-gray-500'}`} />
              </button>
            </div>
            <p className="text-sm font-bold text-ink w-20 text-right">
              {formatCurrency(item.total)}
            </p>
            <button
              onClick={() => removeItem(item.productId, item.saleType)}
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4 space-y-3">
        {/* Payment Method */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Payment Method</label>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  paymentMethod === m.value
                    ? 'bg-wine-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Order note (optional)..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs
                     focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
        />

        {/* Totals */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tax</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-ink border-t border-gray-100 pt-2">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Checkout */}
        <button
          onClick={onCheckout}
          disabled={processing || items.length === 0}
          className="w-full py-3 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                     text-white font-semibold rounded-lg text-sm transition-colors
                     flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              Complete Sale · {formatCurrency(grandTotal)}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
