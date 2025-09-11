import type { Server } from 'http'
import cookie from 'cookie'
import { getUserData } from '../utils/user'
import { transactionsSocket } from './transactions'

export const initializeSockets = (server: Server) => {
  server.on('upgrade', async (req, socket, head) => {
    const { url } = req
    const cookies = cookie.parse(req.headers.cookie ?? '')
    const sessionCookie = cookies['__session']

    if (!sessionCookie) {
      return socket.destroy()
    }

    try {
      const user = await getUserData(sessionCookie)
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
