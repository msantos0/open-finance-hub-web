import api from './api'
import type { CategoryExpense, DashboardSummary, MonthlyEvolution } from '../types/dashboard'
import type { Transaction } from '../types/transaction'

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/api/dashboard/summary')
    return response.data
  },

  async getCategoryExpenses(): Promise<CategoryExpense[]> {
    const response = await api.get<CategoryExpense[]>('/api/dashboard/category-expenses')
    return response.data
  },

  async getMonthlyEvolution(): Promise<MonthlyEvolution[]> {
    const response = await api.get<MonthlyEvolution[]>('/api/dashboard/monthly-evolution')
    return response.data
  },

  async getRecentTransactions(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/api/dashboard/recent-transactions')
    return response.data
  },
}
