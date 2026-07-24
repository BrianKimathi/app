/**
 * Barcode index for fast product lookup.
 * Maintains an in-memory map of barcode → productId.
 */

let barcodeIndex = null

export function buildBarcodeIndex(products) {
  barcodeIndex = {}
  for (const product of products) {
    if (product.barcode) {
      barcodeIndex[product.barcode.trim()] = product.id
    }
  }
  return barcodeIndex
}

export function findProductByBarcode(barcode, products) {
  if (!barcode || !products.length) return null

  const code = barcode.trim()
  if (!code) return null

  // Try direct match first
  const product = products.find(p => p.barcode === code)
  if (product) return product

  // Try from index if built
  if (barcodeIndex && barcodeIndex[code]) {
    return products.find(p => p.id === barcodeIndex[code]) || null
  }

  return null
}

export function isValidBarcode(code) {
  if (!code) return false
  return /^[0-9]{8,14}$/.test(code.trim())
}
