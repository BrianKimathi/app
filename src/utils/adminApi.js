/**
 * Firebase Auth REST API for admin user management.
 * Uses the Firebase Identity Toolkit REST API to create users
 * without affecting the current admin session.
 *
 * Docs: https://firebase.google.com/docs/reference/rest/auth
 */

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY
const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`

export async function createFirebaseUser(email, password) {
  if (!API_KEY) throw new Error('Firebase API key not configured')

  const res = await fetch(`${AUTH_URL}:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true
    })
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data.error?.message || 'Failed to create user'
    // Map Firebase error codes to user-friendly messages
    const friendly = {
      'EMAIL_EXISTS': 'An account with this email already exists',
      'WEAK_PASSWORD': 'Password should be at least 6 characters',
      'INVALID_EMAIL': 'Invalid email address',
      'OPERATION_NOT_ALLOWED': 'Email/password sign-up is not enabled in Firebase Console',
      'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many attempts. Please try again later'
    }
    throw new Error(friendly[msg] || msg)
  }

  return {
    localId: data.localId,
    email: data.email,
    idToken: data.idToken
  }
}
