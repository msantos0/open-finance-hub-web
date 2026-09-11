import api from './api'
import type { Transaction, TransactionRequest } from '../types/transaction'

const transactionsPath = '/api/transactions'

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(transactionsPath)
    return response.data
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`${transactionsPath}/${id}`)
    return response.data
  },

  async create(transaction: TransactionRequest): Promise<Transaction> {
    const response = await api.post<Transaction>(transactionsPath, transaction)
    return response.data
  },

  async update(id: string, transaction: TransactionRequest): Promise<Transaction> {
    const response = await api.put<Transaction>(`${transactionsPath}/${id}`, transaction)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${transactionsPath}/${id}`)
  },
}
