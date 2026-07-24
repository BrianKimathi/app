import { useState, useEffect } from 'react'
import { ref, onValue, off, query, orderByChild } from 'firebase/database'
import { db } from '../firebase'
import { Clock, Play, Square, DollarSign, ShoppingCart } from 'lucide-react'
import ShiftForm from '../components/ShiftForm'
import { useShift } from '../contexts/ShiftContext'
import { formatCurrency, formatDateTime, formatRelativeTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ShiftsPage() {
  const [allShifts, setAllShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('start')
  const { activeShift } = useShift()

  useEffect(() => {
    const shiftsRef = query(ref(db, 'wine/shifts'), orderByChild('startTime'))
    const unsub = onValue(shiftsRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ id: child.key, ...child.val() })
      })
      data.sort((a, b) => {
        const ta = a.startTime ? (a.startTime.toDate ? a.startTime.toDate() : new Date(a.startTime)) : new Date(0)
        const tb = b.startTime ? (b.startTime.toDate ? b.startTime.toDate() : new Date(b.startTime)) : new Date(0)
        return tb - ta
      })
      setAllShifts(data)
      setLoading(false)
    })
    return () => off(unsub)
  }, [])

  const openShifts = allShifts.filter(s => s.status === 'open')
  const closedShifts = allShifts.filter(s => s.status === 'closed')

  if (loading) return <LoadingSpinner message="Loading shifts..." />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Shifts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {openShifts.length > 0 ? `${openShifts.length} active shift${openShifts.length > 1 ? 's' : ''}` : 'No active shifts'}
          </p>
        </div>
        {activeShift ? (
          <button onClick={() => { setFormMode('end'); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700
                       text-white rounded-lg text-sm font-medium transition-colors">
            <Square size={16} /> End Shift
          </button>
        ) : (
          <button onClick={() => { setFormMode('start'); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700
                       text-white rounded-lg text-sm font-medium transition-colors">
            <Play size={16} /> Start Shift
          </button>
        )}
      </div>

      {/* Active Shift Banner */}
      {activeShift && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Clock size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Active Shift</p>
                <p className="text-sm text-green-600">
                  {activeShift.cashierName} · Opened with {formatCurrency(activeShift.openingFloat || 0)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-800">
                {formatCurrency(activeShift.totalSales || 0)}
              </p>
              <p className="text-xs text-green-600">Total Sales</p>
            </div>
          </div>
        </div>
      )}

      {/* Shift History */}
      {allShifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Clock size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No shifts yet</p>
          <p className="text-xs mt-1">Start a shift to begin tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Shift History ({allShifts.length})
          </h2>
          {allShifts.map(shift => (
            <div key={shift.id}
              className="bg-white rounded-xl border border-gray-100 shadow-soft p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    shift.status === 'open' ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <Clock size={18} className={
                      shift.status === 'open' ? 'text-green-600' : 'text-gray-500'
                    } />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{shift.cashierName || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">
                      {shift.startTime ? formatDateTime(shift.startTime) : '—'}
                      {shift.endTime ? ` → ${formatDateTime(shift.endTime)}` : ' (ongoing)'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">
                    {formatCurrency(shift.totalSales || 0)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    shift.status === 'open'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {shift.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Float info */}
              <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Opening Float</span>
                  <p className="font-medium text-ink">{formatCurrency(shift.openingFloat || 0)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Closing Float</span>
                  <p className="font-medium text-ink">
                    {shift.closingFloat != null ? formatCurrency(shift.closingFloat) : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Expected</span>
                  <p className="font-medium text-ink">
                    {shift.totalSales != null
                      ? formatCurrency((shift.openingFloat || 0) + shift.totalSales)
                      : '—'}
                  </p>
                </div>
              </div>

              {shift.note && (
                <p className="text-xs text-gray-400 mt-2">{shift.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && <ShiftForm mode={formMode} onClose={() => setShowForm(false)} />}
    </div>
  )
}
