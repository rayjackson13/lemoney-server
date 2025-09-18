import type { DecodedIdToken } from 'firebase-admin/auth'
import { adminAuth } from './firebase'

export const getUserData = async (token: string | undefined): Promise<DecodedIdToken | null> => {
  if (!token) return null

  const decodedToken = await adminAuth.verifySessionCookie(token)
  return decodedToken ?? null
}
