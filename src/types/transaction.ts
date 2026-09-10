export const transactionTypes = ['INCOME', 'EXPENSE'] as const

export type TransactionType = (typeof transactionTypes)[number]

export interface TransactionRequest {
  description: string
  amount: number
  transactionType: TransactionType
  transactionDate: string
  categoryId: string
  accountId: string
}

export interface Transaction extends TransactionRequest {
  id: string
  createdAt?: string
  updatedAt?: string
}
