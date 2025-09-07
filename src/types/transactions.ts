export const TransactionTypes = {
  Expense: 'Расход',
  ExpensePlanned: 'План',
  Income: 'Доход',
  Investment: 'Инвестиции',
  Savings: 'Сбережения',
} as const

export type Transaction = {
  amount: number | null
  category: string | null
  date: string
  description?: string
  id: string
  type?: keyof typeof TransactionTypes
}

export type TransactionDTO = Transaction & {
  key: string
}

export type Filters = {
  dateFrom: string | null
  dateTo: string | null
}
