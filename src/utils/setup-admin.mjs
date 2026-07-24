/**
 * Firebase Admin Setup Script
 * Creates the default admin user and assigns their role in RTDB.
 *
 * Usage:
 *   node src/utils/setup-admin.mjs
 */

import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Load service account
const serviceAccountPath = resolve(__dirname, '../../../kile-kitabu-firebase-adminsdk-fbsvc-dbb20e49cd.json')
const serviceAccount = JSON.parse(require('fs').readFileSync(serviceAccountPath, 'utf8'))

// Initialize Firebase Admin (using CJS require to avoid ESM issues)
const admin = require('firebase-admin')

if (!admin.apps || !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://kile-kitabu-default-rtdb.firebaseio.com'
  })
}

const auth = admin.auth()
const db = admin.database()

const ADMIN_EMAIL = 'admin@cellarspirits.com'
const ADMIN_PASSWORD = 'ChangeMe123!'

async function setup() {
  console.log('')
  console.log('🔧  Setting up admin user...')
  console.log('')

  let uid

  // Step 1: Create or find the user in Firebase Auth
  try {
    const userRecord = await auth.getUserByEmail(ADMIN_EMAIL)
    uid = userRecord.uid
    console.log(`  ✅  Admin user already exists: ${ADMIN_EMAIL} (${uid})`)
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: 'Admin'
      })
      uid = userRecord.uid
      console.log(`  ✅  Admin user created: ${ADMIN_EMAIL} (${uid})`)
    } else {
      throw err
    }
  }

  // Step 2: Set the admin role in Realtime Database under /wine/users/{uid}
  await db.ref(`wine/users/${uid}`).set({
    email: ADMIN_EMAIL,
    role: 'admin',
    displayName: 'Admin',
    createdAt: Date.now()
  })
  console.log(`  ✅  Admin role set at /wine/users/${uid}`)

  // Step 3: Verify
  const snap = await db.ref(`wine/users/${uid}/role`).get()
  const role = snap.val()
  console.log(`  ✅  Verified: role = "${role}"`)
  console.log('')

  console.log('✨  Setup complete! Login with:')
  console.log(`     URL:      http://localhost:5174`)
  console.log(`     Email:    ${ADMIN_EMAIL}`)
  console.log(`     Password: ${ADMIN_PASSWORD}`)
  console.log('')

  process.exit(0)
}

setup().catch(err => {
  console.error('')
  console.error('❌  Setup failed:', err.message)
  console.error('')
  process.exit(1)
})
