export interface DashboardSummary {
  currentBalance: number
  monthlyIncome?: number
  monthlyExpense?: number
  monthlyResult?: number
  totalIncome?: number
  totalExpense?: number
  transactionCount?: number
}

export interface CategoryExpense {
  category: string
  amount: number
}

export interface MonthlyEvolution {
  month: string
  income: number
  expense: number
}
