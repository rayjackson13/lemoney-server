import type { Server } from 'http'
import { WebSocketServer } from 'ws'
import cookie from 'cookie'
import { getUserData } from '../utils/user'
import { adminFS } from '../utils/firebase'
import type { CollectionReference, Query } from 'firebase-admin/firestore'
import type { TransactionDTO } from '../types/transactions'

const transactionsWSS = new WebSocketServer({ noServer: true })

export const initializeSockets = (server: Server) => {
  server.on('upgrade', async (req, socket, head) => {
    const { url } = req
    const cookies = cookie.parse(req.headers.cookie ?? '')
    console.log(cookies)
    const sessionCookie = cookies['__session']

    if (!sessionCookie) {
      socket.destroy()
      return
    }

    try {
      const user = await getUserData(sessionCookie)
      if (!user) {
        socket.destroy()
        return
      }

      req.user = user
      if (url === '/transactions') {
        transactionsWSS.handleUpgrade(req, socket, head, (ws) => {
          transactionsWSS.emit('connection', ws, req)
        })
      } else {
        socket.destroy()
      }
    } catch (err) {
      console.error('Invalid Firebase token:', err)
      socket.destroy()
    }
  })
}

// const broadcastTransactions = (data: TransactionDTO[]) => {
//   transactionsWSS.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(data))
//     }
//   })
// }

transactionsWSS.on('connection', (ws, req) => {
  const userId = req.user.uid

  if (!userId) {
    ws.close()
    return
  }

  const query: CollectionReference | Query = adminFS.collection(`/users/${userId}/transactions`)

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

  ws.on('close', () => {
    unsubscribe()
  })
})
