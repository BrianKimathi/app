/**
 * CSV Report generation utilities
 */

function escapeCsv(value) {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function downloadCsv(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\n')

  const BOM = '﻿'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadSalesReport(sales, periodLabel = 'all') {
  const headers = [
    'Sale ID', 'Date', 'Time', 'Items', 'Total', 'Payment Method',
    'Cashier', 'Status', 'Note'
  ]

  const rows = sales.map(sale => {
    const date = sale.createdAt
      ? (sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt))
      : new Date(0)
    const itemSummary = (sale.items || [])
      .map(i => `${i.productName} (${i.saleType === 'shot' ? 'Shot' : 'Btl'} ×${i.quantity})`)
      .join('; ')

    return [
      sale.id || '',
      date.toLocaleDateString('en-US'),
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      itemSummary,
      (sale.grandTotal || sale.total || 0).toFixed(2),
      sale.paymentMethod || '',
      sale.cashierName || '',
      sale.status || 'completed',
      sale.note || ''
    ]
  })

  downloadCsv(`sales-report-${periodLabel}-${Date.now()}`, headers, rows)
}

export function downloadInventoryReport(products) {
  const headers = [
    'Product Name', 'Category', 'Price', 'Shot Price',
    'Stock', 'ABV%', 'Volume (ml)', 'Status', 'Description'
  ]

  const rows = products.map(p => [
    p.name || '',
    p.category || '',
    p.price ? p.price.toFixed(2) : '',
    p.shotPrice ? p.shotPrice.toFixed(2) : '',
    p.stock ?? 0,
    p.abv || '',
    p.volume || '',
    p.stock <= 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock',
    p.description || ''
  ])

  downloadCsv(`inventory-report-${Date.now()}`, headers, rows)
}

export function downloadDashboardReport(sales, summary, periodLabel = 'today') {
  const headers = [
    'Metric', 'Value'
  ]

  const rows = [
    ['Period', periodLabel],
    ['Total Revenue', `$${summary.totalRevenue.toFixed(2)}`],
    ['Total Transactions', summary.totalTransactions],
    ['Average Sale', `$${summary.avgSale.toFixed(2)}`],
    ['Bottles Sold', summary.bottleSales],
    ['Shots Sold', summary.shotSales],
    ['Unique Products Sold', summary.uniqueProducts],
    ['Report Generated', new Date().toLocaleString('en-US')],
    [],
    ['Top Products', 'Quantity Sold'],
    ...summary.topProducts.map(([name, qty]) => [name, qty])
  ]

  downloadCsv(`dashboard-summary-${periodLabel}-${Date.now()}`, headers, rows)
}
