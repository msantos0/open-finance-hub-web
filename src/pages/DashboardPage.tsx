import { useEffect, useState } from 'react'
import { AccountBalanceWalletOutlined, ArrowDownward, ArrowUpward, SavingsOutlined } from '@mui/icons-material'
import { Alert, Box, Card, CardContent, CircularProgress, Grid, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { accountService } from '../services/accountService'
import { categoryService } from '../services/categoryService'
import { dashboardService } from '../services/dashboardService'
import type { Account } from '../types/account'
import type { Category } from '../types/category'
import type { CategoryExpense, DashboardSummary, MonthlyEvolution } from '../types/dashboard'
import type { Transaction, TransactionType } from '../types/transaction'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormat = new Intl.DateTimeFormat('en-US')
const chartColors = ['#176b5b', '#e4a11b', '#b4533c', '#287a52', '#6b7280', '#8b6418']

const cards = [
  { key: 'currentBalance', label: 'Current Balance', icon: <AccountBalanceWalletOutlined />, color: '#176b5b', background: '#e4f3ef' },
  { key: 'monthlyIncome', label: 'Monthly income', icon: <ArrowUpward />, color: '#287a52', background: '#e8f5e9' },
  { key: 'monthlyExpense', label: 'Monthly expenses', icon: <ArrowDownward />, color: '#b4533c', background: '#fff0eb' },
  { key: 'monthlyResult', label: 'Monthly result', icon: <SavingsOutlined />, color: '#8b6418', background: '#fff6df' },
] as const

const transactionTypeLabels: Record<TransactionType, string> = { INCOME: 'Income', EXPENSE: 'Expense' }

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? date : dateFormat.format(parsedDate)
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([])
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolution[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    void Promise.all([
      dashboardService.getSummary(),
      dashboardService.getCategoryExpenses(),
      dashboardService.getMonthlyEvolution(),
      dashboardService.getRecentTransactions(),
      accountService.getAll(),
      categoryService.getAll(),
    ]).then(([loadedSummary, loadedCategoryExpenses, loadedMonthlyEvolution, loadedRecentTransactions, loadedAccounts, loadedCategories]) => {
      setSummary(loadedSummary)
      setCategoryExpenses(loadedCategoryExpenses)
      setMonthlyEvolution(loadedMonthlyEvolution)
      setRecentTransactions(loadedRecentTransactions)
      setAccounts(loadedAccounts)
      setCategories(loadedCategories)
    }).catch(() => setError(true)).finally(() => setLoading(false))
  }, [])

  const monthlyIncome = summary?.monthlyIncome ?? summary?.totalIncome ?? 0
  const monthlyExpense = summary?.monthlyExpense ?? summary?.totalExpense ?? 0
  const monthlyResult = summary?.monthlyResult ?? monthlyIncome - monthlyExpense
  const currentBalance = summary?.currentBalance ?? 0
  const expenseRate = monthlyIncome > 0 ? Math.min(100, Math.max(0, Math.round((monthlyExpense / monthlyIncome) * 100))) : 0
  const coverageMonths = monthlyExpense > 0 ? (currentBalance / monthlyExpense).toFixed(1) : '0.0'
  const accountNames = new Map(accounts.map((account) => [account.id, `${account.name} - ${account.bank}`]))
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Good morning, Marcio</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Here is what is happening with your money today.</Typography>
      </Box>
      {error && <Alert severity="error">Unable to load your dashboard analytics. Check that the backend is running.</Alert>}
      {loading ? <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}><CircularProgress /></Box> : (
        <Stack spacing={2.5}>
          <Grid container spacing={2.5}>
            {cards.map((card) => {
              const value = card.key === 'currentBalance' ? currentBalance : card.key === 'monthlyIncome' ? monthlyIncome : card.key === 'monthlyExpense' ? monthlyExpense : monthlyResult
              return <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}><Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}><Box><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{card.label}</Typography><Typography variant="h5" color="text.primary" sx={{ mt: 2, fontWeight: 800 }}>{currency.format(value)}</Typography></Box><Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 2, color: card.color, bgcolor: card.background }}>{card.icon}</Box></Stack></CardContent></Card></Grid>
            })}
+          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 7 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}><Stack spacing={2}><Box><Typography variant="h6" sx={{ fontWeight: 800 }}>Monthly health</Typography><Typography variant="body2" color="text.secondary">How much of your income is currently committed to expenses.</Typography></Box><Box><Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Expense rate</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{expenseRate}%</Typography></Stack><LinearProgress variant="determinate" value={expenseRate} sx={{ height: 10, borderRadius: 5 }} /></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}><Box><Typography variant="caption" color="text.secondary">Available after expenses</Typography><Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800, color: monthlyResult >= 0 ? 'success.main' : 'error.main' }}>{currency.format(monthlyResult)}</Typography></Box><Box><Typography variant="caption" color="text.secondary">Balance coverage</Typography><Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>{coverageMonths} months</Typography></Box></Stack></Stack></CardContent></Card></Grid>
            <Grid size={{ xs: 12, md: 5 }}><Card sx={{ height: '100%', bgcolor: 'primary.dark', color: 'common.white' }}><CardContent sx={{ p: 3 }}><Stack spacing={1.5}><Typography variant="overline" sx={{ opacity: 0.75, fontWeight: 700 }}>Financial snapshot</Typography><Typography variant="h5" sx={{ fontWeight: 800 }}>{monthlyResult >= 0 ? 'Your balance is working for you.' : 'Your monthly spending needs attention.'}</Typography><Typography variant="body2" sx={{ opacity: 0.8 }}>Keep your monthly result positive to grow your available balance over time.</Typography></Stack></CardContent></Card></Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 5 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}><Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Expenses by category</Typography>{categoryExpenses.length === 0 ? <Typography color="text.secondary">No expenses recorded yet.</Typography> : <Box sx={{ width: '100%', height: 280 }}><ResponsiveContainer><PieChart><Pie data={categoryExpenses} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius="78%" paddingAngle={2}>{categoryExpenses.map((entry, index) => <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Box>}</CardContent></Card></Grid>
            <Grid size={{ xs: 12, md: 7 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}><Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Income vs expenses</Typography><Box sx={{ width: '100%', height: 280 }}><ResponsiveContainer><BarChart data={monthlyEvolution}><XAxis dataKey="month" /><YAxis tickFormatter={(value: number) => `$${value}`} /><Tooltip /><Legend /><Bar dataKey="income" name="Income" fill="#287a52" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" name="Expenses" fill="#b4533c" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Box></CardContent></Card></Grid>
          </Grid>

          <Card><CardContent sx={{ p: 3 }}><Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Recent transactions</Typography>{recentTransactions.length === 0 ? <Typography color="text.secondary">No transactions recorded yet.</Typography> : <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Date</TableCell><TableCell>Description</TableCell><TableCell>Category</TableCell><TableCell>Account</TableCell><TableCell align="right">Amount</TableCell><TableCell>Type</TableCell></TableRow></TableHead><TableBody>{recentTransactions.map((transaction) => <TableRow key={transaction.id} hover><TableCell>{formatDate(transaction.transactionDate)}</TableCell><TableCell>{transaction.description}</TableCell><TableCell>{categoryNames.get(transaction.categoryId) ?? 'Unknown'}</TableCell><TableCell>{accountNames.get(transaction.accountId) ?? 'Unknown'}</TableCell><TableCell align="right">{currency.format(transaction.amount)}</TableCell><TableCell sx={{ color: transaction.transactionType === 'INCOME' ? 'success.main' : 'error.main', fontWeight: 700 }}>{transactionTypeLabels[transaction.transactionType]}</TableCell></TableRow>)}</TableBody></Table></TableContainer>}</CardContent></Card>
        </Stack>
      )}
    </Stack>
  )
}
