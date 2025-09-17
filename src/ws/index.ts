import type { Server } from 'http'
import { getUserData } from '../utils/user'
import { transactionsSocket } from './transactions'

export const initializeSockets = (server: Server) => {
  server.on('upgrade', async (req, socket, head) => {
    const { url, headers } = req
    const token = headers.authorization?.replace(/Bearer\s+/, '')

    if (!token) {
      return socket.destroy()
    }

    try {
      const user = await getUserData(token)
      if (!user) {
        return socket.destroy()
      }

      req.user = user
      if (url === '/transactions') {
        transactionsSocket.handleUpgrade(req, socket, head, (ws) => {
          transactionsSocket.emit('connection', ws, req)
        })
      } else {
        return socket.destroy()
      }
    } catch (err) {
      console.error('Invalid Firebase token:', err)
      return socket.destroy()
    }
  })
}
