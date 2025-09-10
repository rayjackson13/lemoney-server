import type { CollectionReference, Query } from 'firebase-admin/firestore'
import { TransactionTypes, type Transaction, type TransactionDTO } from '../types/transactions'
import { adminFS } from './firebase'
import { validateISOString } from './dates'
import { ValidationError } from '../types/HttpError'

export const validateTransactions = (list: Transaction[]): boolean => {
  if (!list || !Array.isArray(list)) {
    throw new ValidationError('Payload must be an array of transactions')
  }

  list.forEach((tx) => {
    if (typeof tx !== 'object' || tx === null) {
      throw new ValidationError('transaction must be a valid object')
    }

    const { amount, date, type } = tx

    if (typeof amount !== 'number' || amount <= 0 || amount > 99_999_999) {
      throw new ValidationError(
        'transaction.amount must be an Integer and must be larger than 0 and less than 99 999 999',
      )
    }

    if (typeof date !== 'string' || !validateISOString(date)) {
      throw new ValidationError('transaction.date must be an ISO string')
    }

    if (typeof type !== 'string' || !(type in TransactionTypes)) {
      throw new ValidationError(
        `transaction.type must be one of: ${Object.keys(TransactionTypes).join(', ')}`,
      )
    }
  })

  return true
}

export const getTransactions = async (userId: string): Promise<TransactionDTO[]> => {
  const query: CollectionReference | Query = adminFS.collection(`/users/${userId}/transactions`)

  const snapshot = await query.get()
  if (snapshot.empty) {
    return []
  }

  return snapshot.docs
    .map((doc) => ({
      ...(doc.data() as TransactionDTO),
      id: doc.id,
    }))
    .toSorted((a, b) => a.key.localeCompare(b.key))
}

export const addTransactions = async (userId: string, data: Transaction[]): Promise<void> => {
  const collection = adminFS.collection(`/users/${userId}/transactions`)
  const timestamp = new Date().getTime()
  let batch = adminFS.batch()
  let count = 0

  for (const item of data) {
    const key = `${timestamp}-${count}`
    const docRef = collection.doc()
    batch.set(docRef, { ...item, key })
    count++

    if (count === 500) {
      await batch.commit()
      batch = adminFS.batch()
      count = 0
    }
  }

  if (count > 0) {
    await batch.commit()
  }
}
