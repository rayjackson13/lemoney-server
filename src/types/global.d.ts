import type { DecodedIdToken } from 'firebase-admin/auth'

declare module 'http' {
  interface IncomingMessage {
    user: DecodedIdToken
  }
}
