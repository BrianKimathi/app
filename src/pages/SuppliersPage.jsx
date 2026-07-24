import { useState, useEffect } from 'react'
import { ref, onValue, off, remove } from 'firebase/database'
import { db } from '../firebase'
import { Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, Building2 } from 'lucide-react'
import SupplierForm from '../components/SupplierForm'
import SearchInput from '../components/SearchInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { useNotification } from '../contexts/NotificationContext'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const { notify } = useNotification()

  useEffect(() => {
    const ref_ = ref(db, 'wine/suppliers')
    const unsub = onValue(ref_, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      setSuppliers(data)
      setLoading(false)
    })
    return () => off(ref_)
  }, [])

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(supplier) {
    setEditingSupplier(supplier)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingSupplier(null)
  }

  async function handleDelete(supplier) {
    if (!window.confirm(`Delete "${supplier.name}"?`)) return
    try {
      await remove(ref(db, `wine/suppliers/${supplier.id}`))
      notify('Supplier deleted', 'success')
    } catch (err) {
      notify('Failed to delete supplier', 'error')
    }
  }

  if (loading) return <LoadingSpinner message="Loading suppliers..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-wine-600 hover:bg-wine-700
                     text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search suppliers..." className="max-w-md" />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Building2 size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No suppliers found</p>
          <p className="text-xs mt-1">{search ? 'Try a different search' : 'Add your first supplier'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(supplier => (
            <div key={supplier.id}
              className="bg-white rounded-xl border border-gray-100 shadow-soft p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-ink">{supplier.name}</h3>
                  {supplier.contactName && (
                    <p className="text-xs text-gray-500 mt-0.5">{supplier.contactName}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(supplier)}
                    className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(supplier)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-gray-500">
                {supplier.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0" /> {supplier.phone}
                  </p>
                )}
                {supplier.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={13} className="shrink-0" /> {supplier.email}
                  </p>
                )}
                {supplier.address && (
                  <p className="flex items-center gap-2">
                    <MapPin size={13} className="shrink-0" /> {supplier.address}
                  </p>
                )}
              </div>

              {supplier.notes && (
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                  {supplier.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SupplierForm supplier={editingSupplier} onClose={handleCloseForm} />
      )}
    </div>
  )
}
