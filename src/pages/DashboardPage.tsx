import { useEffect, useState } from 'react'
import { AccountBalanceWalletOutlined, ArrowDownward, ArrowUpward, ReceiptLongOutlined } from '@mui/icons-material'
import { Alert, Box, Card, CardContent, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { dashboardService } from '../services/dashboardService'
import type { DashboardSummary } from '../types/dashboard'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const cards = [
  { key: 'currentBalance', label: 'Current Balance', icon: <AccountBalanceWalletOutlined />, color: '#176b5b', background: '#e4f3ef', format: currency.format },
  { key: 'totalIncome', label: 'Total Income', icon: <ArrowUpward />, color: '#287a52', background: '#e8f5e9', format: currency.format },
  { key: 'totalExpense', label: 'Total Expense', icon: <ArrowDownward />, color: '#b4533c', background: '#fff0eb', format: currency.format },
  { key: 'transactionCount', label: 'Transactions', icon: <ReceiptLongOutlined />, color: '#8b6418', background: '#fff6df', format: (value: number) => value.toLocaleString('en-US') },
] as const

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(() => setError(true))
  }, [])

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Good morning, Marcio</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Here is what is happening with your money today.</Typography>
      </Box>
      {error && <Alert severity="error">Unable to load your financial summary. Check that the backend is running.</Alert>}
      {!summary && !error ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}><CircularProgress /></Box>
      ) : summary ? (
        <Grid container spacing={2.5}>
          {cards.map((card) => (
            <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{card.label}</Typography>
                      <Typography variant="h5" color="text.primary" sx={{ mt: 2, fontWeight: 800 }}>{card.format(summary[card.key])}</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 2, color: card.color, bgcolor: card.background }}>{card.icon}</Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Stack>
  )
}
