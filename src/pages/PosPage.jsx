import { useState, useEffect } from 'react'
import { ref, onValue, off, push, update, serverTimestamp, runTransaction } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useNotification } from '../contexts/NotificationContext'
import PosProductGrid from '../components/PosProductGrid'
import PosCart from '../components/PosCart'
import BarcodeInput from '../components/BarcodeInput'
import ReceiptModal from '../components/ReceiptModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { useShift } from '../contexts/ShiftContext'

export default function PosPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [lastSale, setLastSale] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const { user } = useAuth()
  const { activeShift } = useShift()
  const cart = useCart()
  const { notify } = useNotification()

  useEffect(() => {
    const prodRef = ref(db, 'wine/products')
    const unsub = onValue(prodRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      setProducts(data)
      setLoading(false)
    })
    return () => off(prodRef)
  }, [])

  async function handleCheckout() {
    if (cart.items.length === 0) return

    setProcessing(true)
    try {
      // Create the sale record
      const saleRef = push(ref(db, 'wine/sales'))
      const saleData = {
        items: cart.items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          saleType: i.saleType,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        grandTotal: cart.grandTotal,
        paymentMethod: cart.paymentMethod,
        cashierId: user?.uid || 'unknown',
        cashierName: user?.email || 'Unknown',
        shiftId: activeShift?.id || null,
        note: cart.note || '',
        status: 'completed',
        createdAt: serverTimestamp()
      }

      await update(ref(db, `wine/sales/${saleRef.key}`), saleData)

      // Decrement stock for each item
      const stockUpdates = {}
      for (const item of cart.items) {
        const product = products.find(p => p.id === item.productId)
        if (product && product.stock != null) {
          const newStock = Math.max(0, product.stock - item.quantity)
          if (product.stock !== newStock) {
            stockUpdates[`products/${item.productId}/stock`] = newStock
          }
        }
      }
      if (Object.keys(stockUpdates).length > 0) {
        await update(ref(db), stockUpdates)
      }

      setLastSale({ id: saleRef.key, ...saleData })
      setShowReceipt(true)
      notify(
        `Sale completed! ${formatSaleSummary(cart.items)}`,
        'success'
      )
      cart.clearCart()
    } catch (err) {
      notify(err.message || 'Checkout failed. Please try again.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  function formatSaleSummary(items) {
    const total = items.reduce((s, i) => s + i.quantity, 0)
    const bottleCount = items.filter(i => i.saleType === 'bottle').reduce((s, i) => s + i.quantity, 0)
    const shotCount = items.filter(i => i.saleType === 'shot').reduce((s, i) => s + i.quantity, 0)
    const parts = []
    if (bottleCount > 0) parts.push(`${bottleCount} bottle${bottleCount > 1 ? 's' : ''}`)
    if (shotCount > 0) parts.push(`${shotCount} shot${shotCount > 1 ? 's' : ''}`)
    return `${total} item${total > 1 ? 's' : ''} (${parts.join(', ')})`
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Point of Sale</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Select products and complete sales
          <span className="ml-2 inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
            {cart.saleType === 'bottle' ? 'Selling: Full Bottles' : 'Selling: Shots'}
          </span>
        </p>
      </div>

      {/* Sale Type Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => cart.setSaleType('bottle')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cart.saleType === 'bottle'
              ? 'bg-wine-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Full Bottles
        </button>
        <button
          onClick={() => cart.setSaleType('shot')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cart.saleType === 'shot'
              ? 'bg-wine-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Shots
        </button>
      </div>

      {/* Barcode Scanner */}
      <BarcodeInput products={products} onProductFound={(product) => {
        if (product) cart.addItem({ ...product, id: product.id }, cart.saleType)
      }} />

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading products..." />
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            <PosProductGrid
              products={products}
              loading={false}
              onAddToCart={(product, type) => cart.addItem(product, type || cart.saleType)}
              currentSaleType={cart.saleType}
            />
          </div>

          {/* Cart */}
          <div className="w-80 lg:w-96 shrink-0 overflow-y-auto">
            <PosCart onCheckout={handleCheckout} processing={processing} />
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <ReceiptModal
          sale={lastSale}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}
