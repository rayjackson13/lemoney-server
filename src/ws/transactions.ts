import type { CollectionReference, Query } from 'firebase-admin/firestore'
import { WebSocket, WebSocketServer } from 'ws'
import { adminFS } from '../utils/firebase'
import type { TransactionDTO } from '../types/transactions'

const transactionsSocket = new WebSocketServer({ noServer: true })

const startListener = (ws: WebSocket, query: CollectionReference | Query): (() => void) => {
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

transactionsSocket.on('connection', (ws, req) => {
  const userId = req.user.uid

  if (!userId) {
    ws.close()
    return
  }

  const collectionPath = `/users/${userId}/transactions`
  const query: CollectionReference | Query = adminFS.collection(collectionPath)
  const unsubscribe = startListener(ws, query)

  ws.on('error', (err) => {
    console.error('WebScoket error', err)
    unsubscribe()
  })

  ws.on('close', () => {
    unsubscribe()
  })
})

export { transactionsSocket }
