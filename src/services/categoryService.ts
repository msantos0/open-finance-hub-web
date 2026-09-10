import api from './api'
import type { Category, CategoryRequest } from '../types/category'

const categoriesPath = '/api/categories'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>(categoriesPath)
    return response.data
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<Category>(`${categoriesPath}/${id}`)
    return response.data
  },

  async create(category: CategoryRequest): Promise<Category> {
    const response = await api.post<Category>(categoriesPath, category)
    return response.data
  },

  async update(id: string, category: CategoryRequest): Promise<Category> {
    const response = await api.put<Category>(`${categoriesPath}/${id}`, category)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${categoriesPath}/${id}`)
  },
}
