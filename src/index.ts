import './env'
import express from 'express'
import http from 'http'
import cookieParser from 'cookie-parser'
import cors, { type CorsOptions } from 'cors'
import { authRoutes } from './routes/auth'
import { transactionsRoutes } from './routes/transactions'
import { initializeSockets } from './ws'

const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)

app.use(express.json())
app.use(cookieParser())

app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173']

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // allow cookies and auth headers
}

app.use(cors(corsOptions))

app.get('/api/hello', (_req, res) => {
  res.status(200).json({ message: '👋 Hello from TypeScript Express' })
})

app.use('/auth', authRoutes)
app.use('/transactions', transactionsRoutes)

initializeSockets(server)

server.listen(Number(port), () => {
  console.debug(`🚀 Server running at http://localhost:${port}`)
})
