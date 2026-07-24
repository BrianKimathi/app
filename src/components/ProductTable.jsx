import { useState } from 'react'
import { Edit2, Trash2, Search, Wine } from 'lucide-react'
import { ref, update, remove } from 'firebase/database'
import { db } from '../firebase'
import { formatCurrency, getStockStatus } from '../utils/formatters'
import { CATEGORY_COLORS } from '../utils/constants'
import { useNotification } from '../contexts/NotificationContext'
import SearchInput from './SearchInput'
import LoadingSpinner from './LoadingSpinner'

export default function ProductTable({ products, loading, onEdit }) {
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const { notify } = useNotification()

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggleActive(product) {
    try {
      await update(ref(db, `wine/products/${product.id}`), {
        isActive: !product.isActive
      })
      notify(`${product.name} ${product.isActive ? 'deactivated' : 'activated'}`, 'success')
    } catch (err) {
      notify('Failed to update product', 'error')
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setDeletingId(product.id)
    try {
      await remove(ref(db, `wine/products/${product.id}`))
      notify('Product deleted', 'success')
    } catch (err) {
      notify('Failed to delete product', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner message="Loading products..." />

  return (
    <div>
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products by name or category..."
          className="max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Wine size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No products {search ? 'matching your search' : 'yet'}</p>
          <p className="text-xs mt-1">{search ? 'Try a different search' : 'Click "Add Product" to get started'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Shot</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Active</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => {
                  const stock = getStockStatus(product.stock)
                  const color = CATEGORY_COLORS[product.category] || '#999'
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <div>
                            <p className="font-medium text-ink">{product.name}</p>
                            {product.abv && <p className="text-xs text-gray-400">{product.abv}% ABV</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{product.category}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {product.shotPrice ? formatCurrency(product.shotPrice) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right ${stock.color}`}>{stock.label}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            product.isActive !== false ? 'bg-green-400' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                            product.isActive !== false ? 'translate-x-4.5' : 'translate-x-1'
                          }`} style={{ transform: product.isActive !== false ? 'translateX(18px)' : 'translateX(3px)' }} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(product)}
                            className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
