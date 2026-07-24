import { useState } from 'react'
import { Store, User, Shield, Bell, Database } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const { notify } = useNotification()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your store and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <User size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-ink">Admin Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <p className="text-sm text-ink font-medium">{user?.email || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">UID</label>
              <p className="text-xs text-gray-400 font-mono">{user?.uid || '—'}</p>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-wine-50 rounded-lg">
              <Store size={20} className="text-wine-600" />
            </div>
            <h2 className="text-lg font-bold text-ink">Store Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Store Name</label>
              <p className="text-sm text-ink font-medium">Cellar & Spirits</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Version</label>
              <p className="text-sm text-ink font-medium">1.0.0</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Shield size={20} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-ink">Security</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Authentication is handled by Firebase. Admin access is checked against the user database.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p>• Firebase Authentication (email/password)</p>
            <p>• Firebase Realtime Database security rules</p>
            <p>• Admin role verification on login</p>
          </div>
        </div>

        {/* Firebase */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Database size={20} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-ink">Data Management</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            All data is stored in Firebase Realtime Database.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => notify('Data is always in sync with Firebase', 'info')}
              className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                         hover:bg-gray-50 transition-colors"
            >
              Check Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
