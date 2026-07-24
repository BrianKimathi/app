import { createContext, useContext, useState, useEffect } from 'react'
import { ref, onValue, off, push, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const ShiftContext = createContext()

export function ShiftProvider({ children }) {
  const [activeShift, setActiveShift] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const shiftsRef = ref(db, 'wine/shifts')
    const unsub = onValue(shiftsRef, (snap) => {
      let found = null
      snap.forEach(child => {
        const shift = { id: child.key, ...child.val() }
        if (shift.status === 'open' && shift.cashierId === user?.uid) {
          found = shift
        }
      })
      setActiveShift(found)
      setLoading(false)
    })
    return () => off(unsub)
  }, [user?.uid])

  async function startShift(openingFloat = 0, note = '') {
    if (!user) throw new Error('Not authenticated')
    const newRef = push(ref(db, 'wine/shifts'))
    await update(ref(db, `wine/shifts/${newRef.key}`), {
      cashierId: user.uid,
      cashierName: user.email || 'Unknown',
      startTime: serverTimestamp(),
      openingFloat: Number(openingFloat),
      totalSales: 0,
      status: 'open',
      note
    })
    return newRef.key
  }

  async function endShift(closingFloat = 0, note = '') {
    if (!activeShift) throw new Error('No active shift')
    await update(ref(db, `wine/shifts/${activeShift.id}`), {
      endTime: serverTimestamp(),
      closingFloat: Number(closingFloat),
      status: 'closed',
      note: note || activeShift.note || ''
    })
    setActiveShift(null)
  }

  return (
    <ShiftContext.Provider value={{ activeShift, loading, startShift, endShift }}>
      {children}
    </ShiftContext.Provider>
  )
}

export function useShift() {
  const ctx = useContext(ShiftContext)
  if (!ctx) throw new Error('useShift must be used within ShiftProvider')
  return ctx
}
