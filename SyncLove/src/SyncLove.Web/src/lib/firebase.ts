/**
 * Firebase configuration and initialization.
 * This file sets up the Firebase app instance and exports the services.
 */
import { initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

// Initialize services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const analytics: Analytics = getAnalytics(app)

export default app
