import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_EMAIL,
    privateKey: (process.env.FIREBASE_ADMIN_KEY ?? '').replace(/\\n/g, '\n'),
  }),
  databaseURL: 'https://lemoney-32aae.firebaseio.com',
})

export const adminAuth = getAuth(app)
export const adminFS = getFirestore(app)
