export const categoryTypes = ['INCOME', 'EXPENSE'] as const

export type CategoryType = (typeof categoryTypes)[number]

export interface CategoryRequest {
  name: string
  description: string
  type: CategoryType
}

export interface Category {
  id: string
  name: string
  description: string | null
  type: CategoryType
  createdAt?: string
  updatedAt?: string
}

export interface ApiErrorResponse {
  message?: string
  validationErrors?: Record<string, string>
}
