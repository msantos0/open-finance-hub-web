import api from './api'
import type { Account, AccountRequest } from '../types/account'

export const accountService = {
  async getAll(): Promise<Account[]> {
    const response = await api.get<Account[]>('/api/accounts')
    return response.data
  },

  async getActive(): Promise<Account[]> {
    const response = await api.get<Account[]>('/api/accounts/active')
    return response.data
  },

  async create(account: AccountRequest): Promise<Account> {
    const response = await api.post<Account>('/api/accounts', account)
    return response.data
  },

  async update(id: string, account: AccountRequest): Promise<Account> {
    const response = await api.put<Account>(`/api/accounts/${id}`, account)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/accounts/${id}`)
  },
}
