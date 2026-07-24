import { useRef, useEffect } from 'react'
import { X, Printer } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export default function ReceiptModal({ sale, onClose }) {
  const receiptRef = useRef(null)

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      window.print()
      return
    }

    const receiptHtml = generateReceiptHtml(sale)
    printWindow.document.write(receiptHtml)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 300)
  }

  if (!sale) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ink">Receipt</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print receipt"
            >
              <Printer size={18} className="text-gray-600" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-6">
          {/* Brand */}
          <div className="text-center mb-4 pb-4 border-b border-gray-200 border-dashed">
            <h3 className="font-display text-xl font-bold text-ink">Cellar & Spirits</h3>
            <p className="text-xs text-gray-500 mt-1">Liquor Store & POS</p>
          </div>

          {/* Sale Info */}
          <div className="text-xs text-gray-500 mb-3 space-y-1">
            <div className="flex justify-between">
              <span>Receipt #</span>
              <span className="font-mono font-medium text-ink">
                {sale.id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="text-ink">{formatDateTime(sale.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier</span>
              <span className="text-ink">{sale.cashierName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment</span>
              <span className="capitalize text-ink">{sale.paymentMethod || 'Cash'}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 border-dashed pt-3 mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 uppercase">
                  <th className="text-left pb-1 font-medium">Item</th>
                  <th className="text-center pb-1 font-medium">Qty</th>
                  <th className="text-right pb-1 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(sale.items || []).map((item, i) => (
                  <tr key={i}>
                    <td className="py-1.5">
                      <p className="text-ink font-medium">{item.productName}</p>
                      <p className="text-gray-400">
                        {item.saleType === 'shot' ? 'Shot' : 'Bottle'} × {formatCurrency(item.unitPrice)}
                      </p>
                    </td>
                    <td className="py-1.5 text-center text-ink">{item.quantity}</td>
                    <td className="py-1.5 text-right font-medium text-ink">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 border-dashed pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-ink">{formatCurrency(sale.subtotal || sale.grandTotal || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span className="text-ink">{formatCurrency(sale.tax || 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span className="text-ink">Total</span>
              <span className="text-wine-600">{formatCurrency(sale.grandTotal || sale.total || 0)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200 border-dashed text-xs text-gray-400">
            <p>Thank you for your purchase!</p>
            <p className="mt-1">No refunds on opened products</p>
          </div>
        </div>

        {/* Sticky Print Button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 bg-wine-600 hover:bg-wine-700 text-white rounded-lg
                       text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

function generateReceiptHtml(sale) {
  const date = sale.createdAt
    ? (sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt))
    : new Date()

  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })

  const itemsHtml = (sale.items || []).map(item => `
    <tr>
      <td style="padding: 4px 0;">
        <div style="font-weight: 600;">${escapeHtml(item.productName)}</div>
        <div style="color: #888; font-size: 11px;">${item.saleType === 'shot' ? 'Shot' : 'Bottle'} × $${item.unitPrice.toFixed(2)}</div>
      </td>
      <td style="text-align: center; padding: 4px 8px;">${item.quantity}</td>
      <td style="text-align: right; padding: 4px 0; font-weight: 600;">$${item.total.toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        @page { margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #333;
          margin: 0;
          padding: 20px;
          width: 280px;
        }
        .center { text-align: center; }
        .line { border-top: 1px dashed #ccc; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { color: #888; font-size: 11px; text-align: left; padding-bottom: 4px; }
        th.right { text-align: right; }
        th.center { text-align: center; }
        .total-row { font-size: 16px; font-weight: bold; }
        .footer { text-align: center; margin-top: 16px; color: #888; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="center">
        <h2 style="font-family: Georgia, serif; margin-bottom: 4px;">Cellar & Spirits</h2>
        <p style="color: #888; font-size: 11px; margin: 0;">Liquor Store & POS</p>
      </div>
      <div class="line"></div>
      <table>
        <tr><td>Receipt #</td><td style="text-align: right; font-weight: bold;">${escapeHtml(sale.id?.slice(-8).toUpperCase() || '')}</td></tr>
        <tr><td>Date</td><td style="text-align: right;">${dateStr}</td></tr>
        <tr><td>Time</td><td style="text-align: right;">${timeStr}</td></tr>
        <tr><td>Cashier</td><td style="text-align: right;">${escapeHtml(sale.cashierName || '—')}</td></tr>
        <tr><td>Payment</td><td style="text-align: right; text-transform: capitalize;">${escapeHtml(sale.paymentMethod || 'Cash')}</td></tr>
      </table>
      <div class="line"></div>
      <table>
        <thead>
          <tr><th>Item</th><th class="center">Qty</th><th class="right">Total</th></tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="line"></div>
      <table>
        <tr><td>Subtotal</td><td style="text-align: right;">$${(sale.subtotal || sale.grandTotal || 0).toFixed(2)}</td></tr>
        <tr><td>Tax</td><td style="text-align: right;">$${(sale.tax || 0).toFixed(2)}</td></tr>
        <tr class="total-row">
          <td>Total</td>
          <td style="text-align: right; color: #c82a3e;">$${(sale.grandTotal || sale.total || 0).toFixed(2)}</td>
        </tr>
      </table>
      <div class="line"></div>
      <div class="footer">
        <p>Thank you for your purchase!</p>
        <p style="margin-top: 4px;">No refunds on opened products</p>
      </div>
    </body>
    </html>
  `
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
