import './env'
import express from 'express'
import cookieParser from 'cookie-parser'
import { authRoutes } from './routes/auth'
import { transactionsRoutes } from './routes/transactions'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())

app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

app.get('/api/hello', (_req, res) => {
  res.status(200).json({ message: '👋 Hello from TypeScript Express' })
})

app.use('/auth', authRoutes)
app.use('/transactions', transactionsRoutes)

app.listen(Number(port), () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})
