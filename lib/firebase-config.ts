import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Determine the current environment
const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true'

// Get the deployment URL for Vercel environments
const deploymentUrl = process.env.VERCEL_URL || 'z-plot-app.vercel.app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Use the Firebase auth domain in production, but allow local development
  authDomain: isProduction 
    ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 
    : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Log the configuration in development to help with debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? '[REDACTED]' : undefined,
  })
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
