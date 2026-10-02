export const investmentTypes = ['CDB', 'LCI', 'LCA', 'TESOURO', 'FUNDO', 'ACAO', 'ETF', 'CRI', 'CRA'] as const

export type InvestmentType = (typeof investmentTypes)[number]

export interface InvestmentRequest {
  type: InvestmentType
  institution: string
  description: string
  investedAmount: number
  currentValue: number
  annualRate: number
  applicationDate: string
  maturityDate: string | null
}

export interface InvestmentResponse extends InvestmentRequest {
  id: string
  createdAt?: string
  updatedAt?: string
}