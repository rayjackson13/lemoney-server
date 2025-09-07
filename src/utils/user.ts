import type { DecodedIdToken } from 'firebase-admin/auth'
import { adminAuth } from './firebase'

export const getUserData = async (
  sessionCookie: string | undefined,
): Promise<DecodedIdToken | null> => {
  if (!sessionCookie) return null

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie)
    return decodedToken ?? null
  } catch (e) {
    console.error(e)
    return null
  }
}
