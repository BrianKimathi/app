import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import ShiftForm from './ShiftForm'
import { useShift } from '../contexts/ShiftContext'
import { Clock, Play } from 'lucide-react'

export default function Layout() {
  const { activeShift } = useShift()
  const [showShiftForm, setShowShiftForm] = useState(false)
  const location = useLocation()
  const isPos = location.pathname === '/pos'

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Active shift bar */}
        {activeShift && !isPos && (
          <div className="bg-green-600 text-white px-6 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Shift active · {activeShift.cashierName}</span>
            </div>
            <span className="font-semibold">
              ${(activeShift.totalSales || 0).toFixed(2)}
            </span>
          </div>
        )}
        {!activeShift && !isPos && (
          <button onClick={() => setShowShiftForm(true)}
            className="bg-gray-100 text-gray-500 px-6 py-1.5 flex items-center justify-center gap-1.5 text-xs
                       hover:bg-gray-200 transition-colors">
            <Play size={12} />
            Start Shift
          </button>
        )}

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {showShiftForm && <ShiftForm mode="start" onClose={() => setShowShiftForm(false)} />}
    </div>
  )
}
