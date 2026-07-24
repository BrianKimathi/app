import { useState } from 'react'
import { Search, Receipt, RotateCcw } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import { PAYMENT_METHODS } from '../utils/constants'
import SearchInput from './SearchInput'
import LoadingSpinner from './LoadingSpinner'

export default function SalesTable({ sales, loading, onRefund }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = sales.filter(s =>
    s.cashierName?.toLowerCase().includes(search.toLowerCase()) ||
    s.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
    s.items?.some(i => i.productName?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <LoadingSpinner message="Loading sales..." />

  return (
    <div>
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by cashier, payment method, or product..."
          className="max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Receipt size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No sales found</p>
          <p className="text-xs mt-1">{search ? 'Try a different search' : 'Sales will appear here after POS transactions'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sale => (
            <div key={sale.id}
                 className="bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden">
              {/* Sale Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50"
                onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-wine-50 p-2.5 rounded-lg">
                    <Receipt size={20} className="text-wine-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Sale #{sale.id?.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">{formatDateTime(sale.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">{formatCurrency(sale.grandTotal || sale.total)}</p>
                    <p className="text-xs text-gray-400 capitalize">{sale.paymentMethod}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded font-medium ${
                    sale.cashierName ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {sale.cashierName || 'Walk-in'}
                  </div>
                </div>
              </div>

              {/* Expanded Items */}
              {expandedId === sale.id && (
                <div className="border-t border-gray-100 p-4">
                  <table className="w-full text-sm mb-3">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase border-b border-gray-50">
                        <th className="text-left pb-2 font-medium">Item</th>
                        <th className="text-center pb-2 font-medium">Type</th>
                        <th className="text-center pb-2 font-medium">Qty</th>
                        <th className="text-right pb-2 font-medium">Price</th>
                        <th className="text-right pb-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items?.map((item, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-gray-700">{item.productName}</td>
                          <td className="py-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              item.saleType === 'shot' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {item.saleType === 'shot' ? 'Shot' : 'Bottle'}
                            </span>
                          </td>
                          <td className="py-2 text-center text-gray-500">{item.quantity}</td>
                          <td className="py-2 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {sale.note && (
                    <p className="text-xs text-gray-400 mb-2">Note: {sale.note}</p>
                  )}

                  {onRefund && sale.status !== 'refunded' && (
                    <button
                      onClick={() => onRefund(sale)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      <RotateCcw size={13} />
                      Refund Sale
                    </button>
                  )}
                  {sale.status === 'refunded' && (
                    <span className="text-xs text-red-500 font-medium">Refunded</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
