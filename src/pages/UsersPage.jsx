import { useState, useEffect } from 'react'
import { ref, onValue, off, update, remove, child, set } from 'firebase/database'
import { db } from '../firebase'
import { createFirebaseUser } from '../utils/adminApi'
import { useNotification } from '../contexts/NotificationContext'
import { UserPlus, Users, Shield, ShieldOff, Trash2, Mail, Search, AlertCircle } from 'lucide-react'
import SearchInput from '../components/SearchInput'
import LoadingSpinner from '../components/LoadingSpinner'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('staff')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const { notify } = useNotification()

  useEffect(() => {
    const usersRef = ref(db, 'wine/users')
    const unsub = onValue(usersRef, (snap) => {
      const data = []
      snap.forEach(child => {
        data.push({ uid: child.key, ...child.val() })
      })
      // Sort: admins first, then by email
      data.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1
        if (a.role !== 'admin' && b.role === 'admin') return 1
        return (a.email || '').localeCompare(b.email || '')
      })
      setUsers(data)
      setLoading(false)
    })
    return () => off(usersRef)
  }, [])

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreateError('')

    if (!newEmail.trim() || !newPassword) {
      setCreateError('Email and password are required')
      return
    }
    if (newPassword.length < 6) {
      setCreateError('Password must be at least 6 characters')
      return
    }

    setCreating(true)
    try {
      // Create user in Firebase Auth
      const newUser = await createFirebaseUser(newEmail.trim(), newPassword)

      // Set role in RTDB
      await set(ref(db, `wine/users/${newUser.localId}`), {
        email: newEmail.trim(),
        role: newRole,
        displayName: newEmail.trim().split('@')[0],
        createdAt: Date.now()
      })

      notify(`User ${newEmail.trim()} created successfully`, 'success')
      setShowCreate(false)
      setNewEmail('')
      setNewPassword('')
      setNewRole('staff')
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleToggleRole(user) {
    const newRole = user.role === 'admin' ? 'staff' : 'admin'
    if (newRole === 'staff') {
      if (!window.confirm(`Remove admin role from ${user.email}?`)) return
    }
    try {
      await update(ref(db, `wine/users/${user.uid}`), { role: newRole })
      notify(`${user.email} is now ${newRole}`, 'success')
    } catch (err) {
      notify('Failed to update role', 'error')
    }
  }

  async function handleDeleteUser(user) {
    if (!window.confirm(`Remove user ${user.email} from the system?\n\nNote: The Firebase Auth account will still exist, but the user will lose all system access.`)) return
    try {
      await remove(ref(db, `wine/users/${user.uid}`))
      notify(`${user.email} removed from system`, 'success')
    } catch (err) {
      notify('Failed to remove user', 'error')
    }
  }

  if (loading) return <LoadingSpinner message="Loading users..." />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} user{users.length !== 1 ? 's' : ''} · Manage admin staff accounts
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-wine-600 hover:bg-wine-700
                     text-white rounded-lg text-sm font-medium transition-colors"
        >
          <UserPlus size={18} />
          Create User
        </button>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search users by email, name, or role..."
        className="max-w-md"
      />

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-ink">Create New User</h2>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                  placeholder="user@cellarspirits.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500 bg-white"
                >
                  <option value="staff">Staff (POS access)</option>
                  <option value="admin">Admin (full access)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateError('') }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                             hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-wine-600 hover:bg-wine-700 disabled:bg-gray-300
                             text-white rounded-lg text-sm font-medium transition-colors
                             flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Users size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No users found</p>
          <p className="text-xs mt-1">{search ? 'Try a different search' : 'Click "Create User" to get started'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Created</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          user.role === 'admin' ? 'bg-purple-50' : 'bg-blue-50'
                        }`}>
                          <Mail size={16} className={
                            user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'
                          } />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{user.email || 'Unknown'}</p>
                          <p className="text-xs text-gray-400 font-mono">{user.uid?.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? <Shield size={12} /> : <ShieldOff size={12} />}
                        {user.role || 'staff'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="p-1.5 rounded hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                          title={user.role === 'admin' ? 'Remove admin role' : 'Make admin'}
                        >
                          {user.role === 'admin' ? <ShieldOff size={15} /> : <Shield size={15} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove from system"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">About User Management</p>
            <p className="text-amber-700 text-xs">
              New users are created in Firebase Authentication and assigned a role in the database.
              Admin users have full access to all features including user management.
              Staff users can use the POS and view sales but cannot manage users or settings.
              Removing a user from the system revokes their access but does not delete their Firebase Auth account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
