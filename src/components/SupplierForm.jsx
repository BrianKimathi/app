import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ref, push, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import { useNotification } from '../contexts/NotificationContext'

const emptyForm = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  notes: ''
}

export default function SupplierForm({ supplier, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { notify } = useNotification()
  const isEdit = !!supplier

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || '',
        contactName: supplier.contactName || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        notes: supplier.notes || ''
      })
    }
  }, [supplier])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      notify('Supplier name is required', 'error')
      return
    }

    setSaving(true)
    try {
      const data = {
        ...form,
        name: form.name.trim(),
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        updatedAt: serverTimestamp()
      }

      if (isEdit) {
        await update(ref(db, `wine/suppliers/${supplier.id}`), data)
        notify('Supplier updated', 'success')
      } else {
        data.createdAt = serverTimestamp()
        const newRef = push(ref(db, 'wine/suppliers'))
        await update(ref(db, `wine/suppliers/${newRef.key}`), data)
        notify('Supplier added', 'success')
      }
      onClose()
    } catch (err) {
      notify(err.message || 'Failed to save supplier', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ink">
            {isEdit ? 'Edit Supplier' : 'Add Supplier'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="e.g. Premium Wines Distributors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input type="text" name="contactName" value={form.contactName} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="John Doe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                placeholder="+1 555-0123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                placeholder="supplier@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="123 Main St, City, State" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="Payment terms, delivery schedule, etc." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                         hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                         text-white rounded-lg text-sm font-medium transition-colors
                         flex items-center justify-center gap-2">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (isEdit ? 'Update Supplier' : 'Add Supplier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
