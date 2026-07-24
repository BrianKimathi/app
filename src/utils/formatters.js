export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0.00'
  return `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export function formatDate(timestamp) {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(timestamp) {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '—'
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(timestamp)
}

export function getPeriodDateRange(period) {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  switch (period) {
    case 'today':
      return { start, end: now }
    case 'week': {
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      return { start, end: now }
    }
    case 'month':
      start.setDate(1)
      return { start, end: now }
    case 'year':
      start.setMonth(0, 1)
      return { start, end: now }
    case 'all':
    default:
      return { start: new Date(0), end: now }
  }
}

export function getStockStatus(stock) {
  if (stock == null) return { label: 'Unknown', color: 'text-gray-500' }
  if (stock <= 0) return { label: 'Out of Stock', color: 'text-red-600 font-semibold' }
  if (stock <= 5) return { label: `Low (${stock})`, color: 'text-orange-500 font-semibold' }
  return { label: `${stock} in stock`, color: 'text-green-600' }
}
