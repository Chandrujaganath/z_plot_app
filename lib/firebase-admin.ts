import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Check if Firebase Admin is already initialized
const apps = getApps()

if (!apps.length) {
  try {
    // Handle private key formatting for Vercel - it needs to replace escaped newlines
    // Vercel stores multiline environment variables with literal "\n" characters
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined
    
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

    // Verify required environment variables
    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "Missing Firebase Admin environment variables. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set."
      )
      // Use a dummy app configuration for development purposes
      // This allows the app to build even if Firebase Admin isn't properly configured
      initializeApp({
        projectId: "demo-project",
        // @ts-ignore - This is intentional to allow builds to proceed
        credential: { getAccessToken: () => Promise.resolve({ access_token: "demo-token" }) }
      })
    } else {
      // Initialize with actual credentials when available
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      })
      console.log("Firebase Admin initialized successfully")
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)
    // Initialize with a dummy app to prevent build failures
    initializeApp({
      projectId: "demo-project",
      // @ts-ignore - This is intentional to allow builds to proceed
      credential: { getAccessToken: () => Promise.resolve({ access_token: "demo-token" }) }
    })
  }
}

// Export Firebase Admin services
export const auth = getAuth()
export const adminAuth = auth // Alias for backward compatibility
export const adminDb = getFirestore()
