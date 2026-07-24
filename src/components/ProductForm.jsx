import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES } from '../utils/constants'
import { ref, push, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import { useNotification } from '../contexts/NotificationContext'

const emptyForm = {
  name: '',
  category: 'Whiskey',
  price: '',
  shotPrice: '',
  stock: '',
  abv: '',
  volume: '',
  barcode: '',
  description: '',
  isActive: true
}

export default function ProductForm({ product, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { notify } = useNotification()
  const isEdit = !!product

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category: product.category || 'Whiskey',
        price: product.price?.toString() || '',
        shotPrice: product.shotPrice?.toString() || '',
        stock: product.stock?.toString() || '',
        abv: product.abv?.toString() || '',
        volume: product.volume?.toString() || '',
        barcode: product.barcode?.toString() || '',
        description: product.description || '',
        isActive: product.isActive !== false
      })
    }
  }, [product])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      notify('Product name is required', 'error')
      return
    }
    if (!form.price || Number(form.price) <= 0) {
      notify('Price must be greater than 0', 'error')
      return
    }

    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        shotPrice: form.shotPrice ? Number(form.shotPrice) : null,
        stock: form.stock ? Number(form.stock) : 0,
        barcode: form.barcode.trim() || null,
        abv: form.abv ? Number(form.abv) : null,
        volume: form.volume ? Number(form.volume) : null,
        description: form.description.trim() || '',
        isActive: form.isActive,
        updatedAt: serverTimestamp()
      }

      if (isEdit) {
        await update(ref(db, `wine/products/${product.id}`), data)
        notify('Product updated successfully', 'success')
      } else {
        data.createdAt = serverTimestamp()
        const newRef = push(ref(db, 'wine/products'))
        await update(ref(db, `wine/products/${newRef.key}`), data)
        notify('Product added successfully', 'success')
      }
      onClose()
    } catch (err) {
      notify(err.message || 'Failed to save product', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ink">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="e.g. Johnnie Walker Black Label"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500 bg-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bottle Price ($) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shot Price ($)</label>
              <input
                type="number"
                name="shotPrice"
                value={form.shotPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock + ABV Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock (bottles)</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
              <input
                type="number"
                name="abv"
                value={form.abv}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                placeholder="40"
              />
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (UPC/EAN)</label>
            <input
              type="text"
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="0889861192008"
            />
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
            <input
              type="number"
              name="volume"
              value={form.volume}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="750"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="Product description..."
            />
          </div>

          {/* Active */}
          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-wine-600 focus:ring-wine-500"
              />
              <span className="text-sm text-gray-700">Product is active (visible in POS)</span>
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                         hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                         text-white rounded-lg text-sm font-medium transition-colors
                         flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
