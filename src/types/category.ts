export const categoryTypes = ['INCOME', 'EXPENSE'] as const

export type CategoryType = (typeof categoryTypes)[number]

export interface Category {
  id: string
  name: string
  description: string | null
  type: CategoryType
  createdAt?: string
  updatedAt?: string
}
