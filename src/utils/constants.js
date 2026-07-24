export const CATEGORIES = [
  'Whiskey',
  'Whisky',
  'Vodka',
  'Rum',
  'Gin',
  'Tequila',
  'Brandy',
  'Liqueur',
  'Wine',
  'Champagne',
  'Beer',
  'Cider',
  'Sake',
  'Other'
]

export const CATEGORY_COLORS = {
  Whiskey: '#c8a25c',
  Whisky: '#c8a25c',
  Vodka: '#6b8fbe',
  Rum: '#b57c48',
  Gin: '#7bbf7b',
  Tequila: '#d4a86a',
  Brandy: '#a0522d',
  Liqueur: '#c97b9d',
  Wine: '#8b2252',
  Champagne: '#e8d5a3',
  Beer: '#d4a017',
  Cider: '#b8862a',
  Sake: '#f0e6d3',
  Other: '#999999'
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile', label: 'Mobile Money' }
]

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparing', label: 'Preparing', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export const SALE_TYPES = [
  { value: 'bottle', label: 'Full Bottle' },
  { value: 'shot', label: 'Shot' }
]

export const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' }
]

export const DEFAULT_PRODUCT_IMAGE = '/logo.svg'
