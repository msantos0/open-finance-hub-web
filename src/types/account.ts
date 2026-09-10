export const accountTypes = ['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'DIGITAL_WALLET'] as const

export type AccountType = (typeof accountTypes)[number]

export interface AccountRequest {
  name: string
  bank: string
  accountType: AccountType
  initialBalance: number
  active: boolean
}

export interface Account extends AccountRequest {
  id: string
  currentBalance: number
  createdAt?: string
  updatedAt?: string
}
