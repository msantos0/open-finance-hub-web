import api from './api'
import type { DashboardSummary } from '../types/dashboard'

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/api/dashboard/summary')
    return response.data
  },
}
