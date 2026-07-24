import { useState } from 'react'
import { Search, Wine, Beer, Plus, Shirt } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { CATEGORY_COLORS } from '../utils/constants'
import LoadingSpinner from './LoadingSpinner'

export default function PosProductGrid({ products, loading, onAddToCart, currentSaleType }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const categories = ['All', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    if (!p.isActive && p.isActive !== undefined) return false
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  if (loading) return <LoadingSpinner message="Loading products..." />

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500
                       bg-white"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-wine-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Wine size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No products found</p>
          <p className="text-xs mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(product => {
            const outOfStock = product.stock != null && product.stock <= 0
            const color = CATEGORY_COLORS[product.category] || '#999'
            return (
              <button
                key={product.id}
                onClick={() => !outOfStock && onAddToCart(product, currentSaleType)}
                disabled={outOfStock}
                className={`bg-white rounded-xl border border-gray-100 shadow-soft p-3
                           text-left transition-all hover:shadow-md hover:-translate-y-0.5
                           ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                           active:scale-[0.98]`}
              >
                {/* Color indicator */}
                <div className="w-full h-1 rounded-full mb-2.5" style={{ backgroundColor: color }} />

                <h3 className="font-semibold text-sm text-ink leading-tight mb-1 line-clamp-2">
                  {product.name}
                </h3>
                {product.abv && (
                  <p className="text-[10px] text-gray-400 mb-2">{product.abv}% ABV</p>
                )}

                <div className="space-y-1">
                  <p className="text-sm font-bold text-wine-600">
                    {formatCurrency(product.price)}
                    <span className="text-[10px] text-gray-400 font-normal"> /btl</span>
                  </p>
                  {product.shotPrice && (
                    <p className="text-xs text-gray-500">
                      {formatCurrency(product.shotPrice)}{' '}
                      <span className="text-[10px] text-gray-400">/shot</span>
                    </p>
                  )}
                </div>

                {outOfStock ? (
                  <span className="mt-2 inline-block text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                    Out of Stock
                  </span>
                ) : product.stock != null && product.stock <= 5 ? (
                  <span className="mt-2 inline-block text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                    Low: {product.stock}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
