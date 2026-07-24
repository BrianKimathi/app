import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import { Plus, Download } from 'lucide-react'
import ProductTable from '../components/ProductTable'
import ProductForm from '../components/ProductForm'
import LoadingSpinner from '../components/LoadingSpinner'
import { downloadInventoryReport } from '../utils/reports'
import { useNotification } from '../contexts/NotificationContext'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const { notify } = useNotification()

  useEffect(() => {
    const prodRef = ref(db, 'wine/products')
    const unsub = onValue(prodRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      // Sort by name
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      setProducts(data)
      setLoading(false)
    })
    return () => off(prodRef)
  }, [])

  function handleEdit(product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your liquor inventory · {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              downloadInventoryReport(products)
              notify('Inventory report downloaded', 'success')
            }}
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 bg-white
                       text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export Inventory
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-wine-600 hover:bg-wine-700
                       text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleEdit}
      />

      {/* Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
