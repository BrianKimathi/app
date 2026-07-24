import { useState, useRef, useEffect } from 'react'
import { Search, Camera, Barcode } from 'lucide-react'
import { findProductByBarcode } from '../utils/barcode'
import { useNotification } from '../contexts/NotificationContext'

export default function BarcodeInput({ products, onProductFound }) {
  const [value, setValue] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const inputRef = useRef(null)
  const { notify } = useNotification()

  // Auto-focus barcode input for keyboard wedge scanners
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const code = value.trim()
    if (!code) return

    const product = findProductByBarcode(code, products)
    if (product) {
      onProductFound(product)
      notify(`Scanned: ${product.name}`, 'success')
      setValue('')
    } else {
      notify(`No product found for barcode: ${code}`, 'error')
      setValue('')
    }
  }

  return (
    <div className="mb-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Scan or type barcode..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500
                       bg-white font-mono tracking-wider"
            autoComplete="off"
          />
        </div>
        <button type="submit"
          className="px-3 py-2 bg-wine-600 hover:bg-wine-700 text-white rounded-lg text-sm
                     transition-colors flex items-center gap-1.5">
          <Search size={16} />
          Find
        </button>
      </form>
      <p className="text-[10px] text-gray-400 mt-1">
        Barcode scanners work automatically. Type a code and press Enter.
      </p>
    </div>
  )
}
