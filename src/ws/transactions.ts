import type { CollectionReference, Query } from 'firebase-admin/firestore'
import { WebSocket, WebSocketServer } from 'ws'
import { adminFS } from '../utils/firebase'
import type { TransactionDTO } from '../types/transactions'
import { getUserData } from '../utils/user'

const transactionsSocket = new WebSocketServer({ noServer: true })

const startListener = (ws: WebSocket, userUid: string): (() => void) => {
  const collectionPath = `/users/${userUid}/transactions`
  const query: CollectionReference | Query = adminFS.collection(collectionPath)
  const unsubscribe = query.onSnapshot((snapshot) => {
    const allDocs = snapshot.docs
      .map((doc) => ({
        ...(doc.data() as TransactionDTO),
        id: doc.id,
      }))
      .toSorted((a, b) => a.key.localeCompare(b.key))

    ws.send(
      JSON.stringify({
        type: 'transactions_snapshot',
        data: allDocs,
      }),
    )
  })

  return unsubscribe
}

transactionsSocket.on('connection', (ws) => {
  let unsubscribe: (() => void) | null = null

  const closeConnection = (): void => {
    if (typeof unsubscribe === 'function') unsubscribe()
    ws.close()
  }

  ws.on('message', async (bytes) => {
    try {
      const { type, token } = JSON.parse(bytes.toString())
      if (type === 'authorize' && token) {
        const userData = await getUserData(token)

        if (!userData) {
          throw new Error('HTTP/1.1 401 Unauthorized\r\n\r\n')
        }

        unsubscribe = startListener(ws, userData.uid)
      }
    } catch (err) {
      console.error('WebSocket error', err)
      closeConnection()
    }
  })

  ws.on('error', (err) => {
    console.error('WebSocket error', err)
    closeConnection()
  })

  ws.on('close', closeConnection)
})

export { transactionsSocket }
