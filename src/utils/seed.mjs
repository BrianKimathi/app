/**
 * Seed script for Cellar & Spirits
 * Run with: npm run seed
 *
 * Prerequisites:
 * 1. Set up your .env file with Firebase config (copy .env.example)
 * 2. Create an admin user in Firebase Authentication manually
 * 3. Set the user's role in Realtime DB: /users/{uid} = { role: "admin", email: "..." }
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, update, serverTimestamp } from 'firebase/database'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env vars from .env manually (vite processes them, but this is a standalone script)
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../../.env')
    const content = readFileSync(envPath, 'utf-8')
    const vars = {}
    content.split('\n').forEach(line => {
      const [key, ...rest] = line.split('=')
      if (key && !key.startsWith('#')) {
        vars[key.trim()] = rest.join('=').trim()
      }
    })
    return vars
  } catch {
    console.error('❌ No .env file found. Copy .env.example to .env and fill in your Firebase config.')
    process.exit(1)
  }
}

const env = loadEnv()

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

const products = [
  { name: 'Johnnie Walker Black Label', category: 'Whisky', price: 42.99, shotPrice: 5.50, stock: 24, abv: 40, volume: 750, description: 'Smooth, sophisticated blended Scotch whisky with hints of vanilla and dark fruit.' },
  { name: 'Jameson Irish Whiskey', category: 'Whiskey', price: 34.99, shotPrice: 4.50, stock: 30, abv: 40, volume: 750, description: 'Triple-distilled smooth Irish whiskey with notes of vanilla and sherry.' },
  { name: 'Jack Daniel\'s Old No. 7', category: 'Whiskey', price: 29.99, shotPrice: 4.00, stock: 40, abv: 40, volume: 750, description: 'Legendary Tennessee whiskey with a distinct charcoal-mellowed flavor.' },
  { name: 'Macallan 12 Year', category: 'Whisky', price: 89.99, shotPrice: 11.00, stock: 10, abv: 43, volume: 750, description: 'Single malt Scotch with rich dried fruits, sherry, and oak.' },
  { name: 'Absolut Vodka', category: 'Vodka', price: 24.99, shotPrice: 3.50, stock: 50, abv: 40, volume: 750, description: 'Swedish vodka known for its纯净, smooth taste.' },
  { name: 'Grey Goose Vodka', category: 'Vodka', price: 39.99, shotPrice: 5.00, stock: 20, abv: 40, volume: 750, description: 'Premium French vodka made from winter wheat and spring water.' },
  { name: 'Belvedere Vodka', category: 'Vodka', price: 34.99, shotPrice: 4.50, stock: 15, abv: 40, volume: 750, description: 'Luxury Polish vodka crafted from Dankowskie rye.' },
  { name: 'Bacardi Superior Rum', category: 'Rum', price: 19.99, shotPrice: 3.00, stock: 35, abv: 40, volume: 750, description: 'Crystal-clear white rum perfect for cocktails.' },
  { name: 'Captain Morgan Spiced Rum', category: 'Rum', price: 21.99, shotPrice: 3.00, stock: 28, abv: 35, volume: 750, description: 'Caribbean rum with a secret blend of spices.' },
  { name: 'Bombay Sapphire Gin', category: 'Gin', price: 28.99, shotPrice: 4.00, stock: 22, abv: 40, volume: 750, description: 'Vapor-infused gin with 10 exotic botanicals.' },
  { name: 'Tanqueray Gin', category: 'Gin', price: 26.99, shotPrice: 3.50, stock: 18, abv: 47.3, volume: 750, description: 'Exceptional London dry gin with a bold juniper flavor.' },
  { name: 'Patrón Silver Tequila', category: 'Tequila', price: 49.99, shotPrice: 6.00, stock: 16, abv: 40, volume: 750, description: 'Premium silver tequila from the Highlands of Jalisco.' },
  { name: 'Jose Cuervo Especial', category: 'Tequila', price: 24.99, shotPrice: 3.50, stock: 25, abv: 38, volume: 750, description: 'World\'s best-selling tequila, smooth and versatile.' },
  { name: 'Hennessy VS Cognac', category: 'Brandy', price: 44.99, shotPrice: 6.00, stock: 14, abv: 40, volume: 750, description: 'Masterfully blended cognac from France\'s Charente region.' },
  { name: 'Martell VS Single Distillery', category: 'Brandy', price: 39.99, shotPrice: 5.50, stock: 8, abv: 40, volume: 750, description: 'Elegant cognac with fruity notes and a smooth finish.' },
  { name: 'Kahlúa Original', category: 'Liqueur', price: 27.99, shotPrice: 4.00, stock: 12, abv: 20, volume: 750, description: 'Rich coffee liqueur from Mexico, perfect in White Russians.' },
  { name: 'Baileys Irish Cream', category: 'Liqueur', price: 29.99, shotPrice: 4.00, stock: 20, abv: 17, volume: 750, description: 'Creamy blend of Irish whiskey and fresh cream.' },
  { name: 'Jägermeister', category: 'Liqueur', price: 24.99, shotPrice: 3.50, stock: 18, abv: 35, volume: 700, description: 'German herbal liqueur with 56 botanicals.' },
  { name: 'Château Margaux 2015', category: 'Wine', price: 599.99, shotPrice: null, stock: 3, abv: 13.5, volume: 750, description: 'Prestigious Bordeaux from an exceptional vintage.' },
  { name: 'Moët & Chandon Impérial', category: 'Champagne', price: 54.99, shotPrice: null, stock: 12, abv: 12.5, volume: 750, description: 'The iconic non-vintage champagne, crisp and elegant.' },
  { name: 'Corona Extra', category: 'Beer', price: 3.99, shotPrice: null, stock: 100, abv: 4.5, volume: 355, description: 'Mexican pale lager, best served with lime.' },
  { name: 'Heineken', category: 'Beer', price: 3.99, shotPrice: null, stock: 100, abv: 5, volume: 355, description: 'Dutch premium pilsner with a balanced, crisp taste.' },
  { name: 'Guinness Draught', category: 'Beer', price: 5.99, shotPrice: null, stock: 48, abv: 4.2, volume: 440, description: 'Iconic Irish stout with a smooth, creamy head.' },
  { name: 'Stella Artois', category: 'Beer', price: 4.49, shotPrice: null, stock: 72, abv: 5, volume: 330, description: 'Belgian pilsner dating back to 1366.' },
  { name: 'Chivas Regal 12 Year', category: 'Whisky', price: 38.99, shotPrice: 5.00, stock: 18, abv: 40, volume: 750, description: 'Premium blended Scotch with honey and floral notes.' },
  { name: 'Smirnoff Vodka', category: 'Vodka', price: 19.99, shotPrice: 3.00, stock: 60, abv: 40, volume: 750, description: 'No. 1 selling vodka worldwide, triple-distilled.' },
  { name: 'Wild Turkey 101', category: 'Whiskey', price: 32.99, shotPrice: 4.50, stock: 14, abv: 50.5, volume: 750, description: 'High-rye bourbon with a bold, robust flavor.' },
  { name: 'The Glenlivet 12 Year', category: 'Whisky', price: 54.99, shotPrice: 7.00, stock: 9, abv: 40, volume: 750, description: 'Classic single malt Scotch with tropical fruit notes.' },
  { name: 'Hendrick\'s Gin', category: 'Gin', price: 36.99, shotPrice: 5.00, stock: 16, abv: 44, volume: 750, description: 'Uniquely infused with cucumber and rose petals.' },
  { name: 'Don Julio Blanco', category: 'Tequila', price: 54.99, shotPrice: 7.00, stock: 11, abv: 40, volume: 750, description: 'Ultra-premium tequila from the Don Julio family.' },
]

async function seed() {
  console.log('🌱 Seeding Cellar & Spirits products...\n')

  let count = 0
  for (const product of products) {
    try {
      const newRef = push(ref(db, 'wine/products'))
      await update(ref(db, `wine/products/${newRef.key}`), {
        ...product,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      count++
      console.log(`  ✅ ${product.name} (${product.category})`)
    } catch (err) {
      console.error(`  ❌ ${product.name}: ${err.message}`)
    }
  }

  console.log(`\n✨ Done! ${count} products seeded successfully.`)
  process.exit(0)
}

seed()
