import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { ref, onValue, push, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import { useNotification } from '../contexts/NotificationContext'

export default function POForm({ onClose }) {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [lineItems, setLineItems] = useState([{ productId: '', productName: '', quantity: 1, unitCost: 0 }])
  const [saving, setSaving] = useState(false)
  const { notify } = useNotification()

  useEffect(() => {
    const supRef = ref(db, 'wine/suppliers')
    const unsubSup = onValue(supRef, (snap) => {
      const data = []
      snap.forEach(child => data.push({ id: child.key, ...child.val() }))
      setSuppliers(data)
    })
    const prodRef = ref(db, 'wine/products')
    const unsubProd = onValue(prodRef, (snap) => {
      const data = []
      snap.forEach(child => data.push({ id: child.key, ...child.val() }))
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      setProducts(data)
    })
    return () => { unsubSup(); unsubProd() }
  }, [])

  function handleSupplierChange(e) {
    const id = e.target.value
    setSelectedSupplier(id)
  }

  function addLineItem() {
    setLineItems(prev => [...prev, { productId: '', productName: '', quantity: 1, unitCost: 0 }])
  }

  function removeLineItem(index) {
    setLineItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleProductChange(index, productId) {
    const product = products.find(p => p.id === productId)
    setLineItems(prev => prev.map((item, i) =>
      i === index
        ? { ...item, productId, productName: product?.name || '', unitCost: product?.costPrice || product?.price || 0 }
        : item
    ))
  }

  function handleLineItemChange(index, field, value) {
    setLineItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: field === 'quantity' ? parseInt(value) || 1 : parseFloat(value) || 0 } : item
    ))
  }

  const totalCost = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedSupplier) {
      notify('Please select a supplier', 'error')
      return
    }
    if (lineItems.length === 0 || lineItems.every(i => !i.productId)) {
      notify('Add at least one product', 'error')
      return
    }

    setSaving(true)
    try {
      const supplier = suppliers.find(s => s.id === selectedSupplier)
      const newRef = push(ref(db, 'wine/purchaseOrders'))
      await update(ref(db, `wine/purchaseOrders/${newRef.key}`), {
        supplierId: selectedSupplier,
        supplierName: supplier?.name || 'Unknown',
        items: lineItems.filter(i => i.productId).map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitCost: i.unitCost,
          totalCost: i.quantity * i.unitCost
        })),
        totalCost,
        status: 'draft',
        createdAt: serverTimestamp(),
        createdBy: 'Admin'
      })
      notify('Purchase order created', 'success')
      onClose()
    } catch (err) {
      notify(err.message || 'Failed to create PO', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ink">New Purchase Order</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select value={selectedSupplier} onChange={handleSupplierChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500">
              <option value="">Select a supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Products</label>
              <button type="button" onClick={addLineItem}
                className="flex items-center gap-1 text-xs text-wine-600 font-medium hover:text-wine-700">
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <select value={item.productId} onChange={e => handleProductChange(index, e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-wine-500/20">
                    <option value="">Select product...</option>
                    {products.filter(p => p.stock != null).map(p => (
                      <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>
                    ))}
                  </select>
                  <input type="number" value={item.quantity} min="1"
                    onChange={e => handleLineItemChange(index, 'quantity', e.target.value)}
                    className="w-16 px-2 py-1.5 border border-gray-200 rounded text-sm text-center
                               focus:outline-none focus:ring-2 focus:ring-wine-500/20"
                    placeholder="Qty" />
                  <input type="number" value={item.unitCost} min="0" step="0.01"
                    onChange={e => handleLineItemChange(index, 'unitCost', e.target.value)}
                    className="w-24 px-2 py-1.5 border border-gray-200 rounded text-sm
                               focus:outline-none focus:ring-2 focus:ring-wine-500/20"
                    placeholder="Cost" />
                  <span className="text-xs text-gray-500 w-16 text-right">
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </span>
                  <button type="button" onClick={() => removeLineItem(index)}
                    className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end text-sm">
            <span className="text-gray-500 mr-2">Total:</span>
            <span className="font-bold text-ink">${totalCost.toFixed(2)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                         hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                         text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
