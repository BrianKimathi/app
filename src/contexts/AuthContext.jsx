import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { ref, get, child } from 'firebase/database'
import { auth, db } from '../firebase'
import { useNotification } from './NotificationContext'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { notify } = useNotification()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Check role in RTDB
        try {
          const snap = await get(child(ref(db), `wine/users/${firebaseUser.uid}`))
          if (snap.exists() && snap.val().role === 'admin') {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } catch {
          setIsAdmin(false)
        }
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    // Verify admin role
    const snap = await get(child(ref(db), `wine/users/${cred.user.uid}`))
    if (!snap.exists() || snap.val().role !== 'admin') {
      await signOut(auth)
      throw new Error('Access denied. Admin credentials required.')
    }
    setIsAdmin(true)
    notify('Welcome back, admin!', 'success')
    return cred.user
  }

  async function logout() {
    await signOut(auth)
    setUser(null)
    setIsAdmin(false)
    notify('Logged out successfully', 'info')
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
