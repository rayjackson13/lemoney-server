import { Router } from 'express'

import {
  addTransactions,
  deleteTransaction,
  getTransactions,
  validateTransactions,
} from '../utils/transactions'
import type { Transaction } from '../types/transactions'
import { checkUser } from '../middleware/checkUser'
import { asyncHandler } from '../middleware/asyncHandler'

const transactionsRoutes = Router()

transactionsRoutes.use(checkUser)

/* GET /transactions */
transactionsRoutes.get(
  '/',
  asyncHandler(async ({ user }, res) => {
    const transactions = await getTransactions(user.uid)
    return res.status(200).json({ data: transactions })
  }),
)

/* POST /transactions */
transactionsRoutes.post(
  '/',
  asyncHandler(async ({ body, user }, res) => {
    const transactions = body as Transaction[]

    if (!validateTransactions(transactions)) {
      res.status(422).json({ message: 'Incorrect transaction type passed' })
      return
    }

    await addTransactions(user.uid, transactions)
    return res.status(200).json({ message: 'Success' })
  }),
)

/* DELETE /transactions/id */
transactionsRoutes.delete(
  '/:id',
  asyncHandler(async ({ params, user }, res) => {
    if (!params.id) {
      return res.status(422).json({ message: 'Incorrect id' })
    }

    await deleteTransaction(user.uid, params.id)
    return res.status(200).json({ message: 'Success' })
  }),
)

export { transactionsRoutes }
