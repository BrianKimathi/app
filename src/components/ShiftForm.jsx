import { useState } from 'react'
import { X, DollarSign } from 'lucide-react'
import { useShift } from '../contexts/ShiftContext'
import { useNotification } from '../contexts/NotificationContext'

export default function ShiftForm({ onClose, mode = 'start' }) {
  const [float, setFloat] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const { startShift, endShift, activeShift } = useShift()
  const { notify } = useNotification()

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (mode === 'start') {
        await startShift(float ? Number(float) : 0, note)
        notify('Shift started', 'success')
      } else {
        if (!activeShift) {
          notify('No active shift', 'error')
          setSaving(false)
          return
        }
        await endShift(float ? Number(float) : 0, note)
        notify('Shift ended', 'success')
      }
      onClose()
    } catch (err) {
      notify(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ink">
            {mode === 'start' ? 'Start Shift' : 'End Shift'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <DollarSign size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-600">
              {mode === 'start'
                ? 'Enter your opening cash float to start the shift'
                : 'Enter the closing cash float to reconcile'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'start' ? 'Opening Float ($)' : 'Closing Float ($)'}
            </label>
            <input type="number" value={float} onChange={e => setFloat(e.target.value)}
              step="0.01" min="0"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-lg font-bold text-center
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder="0.00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
              placeholder={mode === 'start' ? 'Morning shift' : 'End of day reconciliation'} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                         hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                         text-white rounded-lg text-sm font-medium">
              {saving ? 'Processing...' : mode === 'start' ? 'Start Shift' : 'End Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
