import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import { Plus, Package, Filter } from 'lucide-react'
import POCard from '../components/POCard'
import POForm from '../components/POForm'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')

  function loadPOs() {
    const ref_ = ref(db, 'wine/purchaseOrders')
    const unsub = onValue(ref_, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      data.sort((a, b) => {
        const da = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0)
        const db_ = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0)
        return db_ - da
      })
      setPos(data)
      setLoading(false)
    })
    return unsub
  }

  useEffect(() => {
    const unsub = loadPOs()
    return () => off(unsub)
  }, [])

  const filtered = filter === 'all' ? pos : pos.filter(po => po.status === filter)

  const counts = {
    all: pos.length,
    draft: pos.filter(p => p.status === 'draft').length,
    ordered: pos.filter(p => p.status === 'ordered').length,
    received: pos.filter(p => p.status === 'received').length
  }

  if (loading) return <LoadingSpinner message="Loading purchase orders..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pos.length} total</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-wine-600 hover:bg-wine-700
                     text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} /> New Purchase Order
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'draft', label: 'Draft', count: counts.draft },
          { key: 'ordered', label: 'Ordered', count: counts.ordered },
          { key: 'received', label: 'Received', count: counts.received }
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? 'bg-wine-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Package size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No purchase orders found</p>
          <p className="text-xs mt-1">Create a purchase order to restock inventory</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(po => (
            <POCard key={po.id} po={po} onUpdate={() => { loadPOs() }} />
          ))}
        </div>
      )}

      {showForm && <POForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
