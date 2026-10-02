import api from './api'
import type { InvestmentRequest, InvestmentResponse } from '../types/investment'

const investmentsPath = '/api/investments'

export const investmentService = {
  async getAll(): Promise<InvestmentResponse[]> {
    const response = await api.get<InvestmentResponse[]>(investmentsPath)
    return response.data
  },

  async getById(id: string): Promise<InvestmentResponse> {
    const response = await api.get<InvestmentResponse>(`${investmentsPath}/${id}`)
    return response.data
  },

  async create(investment: InvestmentRequest): Promise<InvestmentResponse> {
    const response = await api.post<InvestmentResponse>(investmentsPath, investment)
    return response.data
  },

  async update(id: string, investment: InvestmentRequest): Promise<InvestmentResponse> {
    const response = await api.put<InvestmentResponse>(`${investmentsPath}/${id}`, investment)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${investmentsPath}/${id}`)
  },
}