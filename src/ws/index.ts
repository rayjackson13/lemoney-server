import type { Server } from 'http'
import { transactionsSocket } from './transactions'

export const initializeSockets = (server: Server) => {
  server.on('upgrade', async (req, socket, head) => {
    try {
      if (req.url === '/transactions') {
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
