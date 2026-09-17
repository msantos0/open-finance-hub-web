import { useEffect, useState } from 'react'
import { AccountBalanceWalletOutlined, ArrowDownward, ArrowUpward, SavingsOutlined } from '@mui/icons-material'
import { Alert, Box, Card, CardContent, CircularProgress, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import { dashboardService } from '../services/dashboardService'
import type { DashboardSummary } from '../types/dashboard'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const cards = [
  { key: 'currentBalance', label: 'Current Balance', icon: <AccountBalanceWalletOutlined />, color: '#176b5b', background: '#e4f3ef', format: currency.format },
  { key: 'monthlyIncome', label: 'Monthly income', icon: <ArrowUpward />, color: '#287a52', background: '#e8f5e9', format: currency.format },
  { key: 'monthlyExpense', label: 'Monthly expenses', icon: <ArrowDownward />, color: '#b4533c', background: '#fff0eb', format: currency.format },
  { key: 'monthlyResult', label: 'Monthly result', icon: <SavingsOutlined />, color: '#8b6418', background: '#fff6df', format: currency.format },
] as const

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState(false)
  const expenseRate = summary && summary.monthlyIncome > 0
    ? Math.min(100, Math.max(0, Math.round((summary.monthlyExpense / summary.monthlyIncome) * 100)))
    : 0
  const coverageMonths = summary && summary.monthlyExpense > 0
    ? (summary.currentBalance / summary.monthlyExpense).toFixed(1)
    : '0.0'

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
        <Stack spacing={2.5}>
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

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>Monthly health</Typography>
                      <Typography variant="body2" color="text.secondary">How much of your income is currently committed to expenses.</Typography>
                    </Box>
                    <Box>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Expense rate</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{expenseRate}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={expenseRate} sx={{ height: 10, borderRadius: 5 }} />
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Available after expenses</Typography>
                        <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800, color: summary.monthlyResult >= 0 ? 'success.main' : 'error.main' }}>
                          {currency.format(summary.monthlyResult)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Balance coverage</Typography>
                        <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>{coverageMonths} months</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ height: '100%', bgcolor: 'primary.dark', color: 'common.white' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="overline" sx={{ opacity: 0.75, fontWeight: 700 }}>Financial snapshot</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {summary.monthlyResult >= 0 ? 'Your balance is working for you.' : 'Your monthly spending needs attention.'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Keep your monthly result positive to grow your available balance over time.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      ) : null}
    </Stack>
  )
}
