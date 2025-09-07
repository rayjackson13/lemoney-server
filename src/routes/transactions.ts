import { Router } from 'express'

import { getUserData } from '../utils/user'
import { validateISOString } from '../utils/dates'
import { addTransactions, getTransactions, validateTransactions } from '../utils/transactions'
import type { Filters, Transaction } from '../types/transactions'
import { HttpError } from '../types/HttpError'

const transactionsRoutes = Router()

/* GET /transactions */
transactionsRoutes.get('/', async (req, res) => {
  const sessionCookie = req.cookies['__session']
  const query = req.query as Filters

  try {
    const user = await getUserData(sessionCookie)

    if (!user) {
      res.status(401).json({ message: 'Unauthorized access denied' })
      return
    }

    const filters = {
      dateFrom: validateISOString(query.dateFrom) ? query.dateFrom : null,
      dateTo: validateISOString(query.dateTo) ? query.dateTo : null,
    }
    const transactions = await getTransactions(user.uid, filters)

    res.status(200).json({ data: transactions })
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

/* POST /transactions */
transactionsRoutes.post('/', async (req, res) => {
  const sessionCookie = req.cookies['__session']
  const transactions = req.body as Transaction[]

  try {
    const user = await getUserData(sessionCookie)

    if (!user) {
      res.status(401).json({ message: 'Unauthorized access denied' })
      return
    }

    if (!validateTransactions(transactions)) {
      res.status(422).json({ message: 'Incorrect transaction type passed' })
      return
    }

    await addTransactions(user.uid, transactions)

    const allData = await getTransactions(user.uid)
    res.status(200).json({ data: allData })
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).json({ message: e.message })
      return
    }

    res.status(500).json({ message: 'Internal server error' })
  }
})

export { transactionsRoutes }
