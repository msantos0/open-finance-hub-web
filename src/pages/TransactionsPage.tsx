import { useEffect, useState } from 'react'
import {
  Add,
  DeleteOutlined,
  EditOutlined,
  ErrorOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { accountService } from '../services/accountService'
import { categoryService } from '../services/categoryService'
import { transactionService } from '../services/transactionService'
import type { Account } from '../types/account'
import type { Category } from '../types/category'
import { transactionTypes, type Transaction, type TransactionRequest, type TransactionType } from '../types/transaction'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
}

const emptyForm: TransactionRequest = {
  description: '',
  amount: 0,
  transactionType: 'EXPENSE',
  transactionDate: new Date().toISOString().slice(0, 10),
  categoryId: '',
  accountId: '',
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback
  const response = error.response
  if (typeof response !== 'object' || response === null || !('data' in response)) return fallback
  const data = response.data
  if (typeof data !== 'object' || data === null) return fallback
  if ('validationErrors' in data && typeof data.validationErrors === 'object' && data.validationErrors !== null) {
    const messages = Object.values(data.validationErrors).filter((message): message is string => typeof message === 'string')
    if (messages.length > 0) return messages.join(' ')
  }
  if ('message' in data && typeof data.message === 'string') return data.message
  return fallback
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString('en-US')
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [form, setForm] = useState<TransactionRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [loadedTransactions, loadedAccounts, loadedCategories] = await Promise.all([
        transactionService.getAll(),
        accountService.getActive(),
        categoryService.getAll(),
      ])
      setTransactions(loadedTransactions)
      setAccounts(loadedAccounts)
      setCategories(loadedCategories)
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load transactions and selections.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const openCreateDialog = () => {
    setEditingTransaction(null)
    setForm({ ...emptyForm, transactionDate: new Date().toISOString().slice(0, 10) })
    setFormError('')
    setDialogOpen(true)
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setForm({
      description: transaction.description,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      transactionDate: transaction.transactionDate,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const updateForm = <K extends keyof TransactionRequest>(field: K, value: TransactionRequest[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validateForm = () => {
    if (!form.accountId) return 'Account is required.'
    if (!form.categoryId) return 'Category is required.'
    if (!form.description.trim()) return 'Description is required.'
    if (form.description.trim().length > 255) return 'Description must have at most 255 characters.'
    if (!Number.isFinite(form.amount) || form.amount <= 0) return 'Amount must be greater than zero.'
    if (!form.transactionDate) return 'Transaction date is required.'
    return ''
  }

  const closeDialog = () => {
    if (!saving) setDialogOpen(false)
  }

  const handleSave = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError('')
    const payload = { ...form, description: form.description.trim() }
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, payload)
        setNotice('Transaction updated successfully.')
      } else {
        await transactionService.create(payload)
        setNotice('Transaction created successfully.')
      }
      setDialogOpen(false)
      await loadData()
    } catch (saveError) {
      setFormError(getErrorMessage(saveError, 'Unable to save this transaction.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await transactionService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setNotice('Transaction deleted successfully.')
      await loadData()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete this transaction.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const accountNames = new Map(accounts.map((account) => [account.id, `${account.name} - ${account.bank}`]))
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
  const unavailableAccountId = editingTransaction && !accountNames.has(editingTransaction.accountId) ? editingTransaction.accountId : ''

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Transactions</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Track your income and expenses.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>New transaction</Button>
      </Stack>

      {error && <Alert severity="error" icon={<ErrorOutlined />}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}><CircularProgress /></Box>
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>No transactions yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Create your first transaction to start tracking your finances.</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={openCreateDialog}>New transaction</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 900 }} aria-label="Transactions table">
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{accountNames.get(transaction.accountId) ?? `Unavailable (${transaction.accountId})`}</TableCell>
                  <TableCell>{categoryNames.get(transaction.categoryId) ?? `Unknown (${transaction.categoryId})`}</TableCell>
                  <TableCell sx={{ color: transaction.transactionType === 'INCOME' ? 'success.main' : 'error.main', fontWeight: 700 }}>{transactionTypeLabels[transaction.transactionType]}</TableCell>
                  <TableCell align="right">{currency.format(transaction.amount)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label={`Edit transaction ${transaction.description}`} onClick={() => openEditDialog(transaction)}><EditOutlined /></IconButton>
                    <IconButton aria-label={`Delete transaction ${transaction.description}`} color="error" onClick={() => setDeleteTarget(transaction)}><DeleteOutlined /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingTransaction ? 'Edit transaction' : 'New transaction'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormControl fullWidth required>
              <InputLabel id="transaction-account-label">Account</InputLabel>
              <Select labelId="transaction-account-label" label="Account" value={form.accountId} onChange={(event) => updateForm('accountId', event.target.value)}>
                {accounts.map((account) => <MenuItem key={account.id} value={account.id}>{account.name} - {account.bank}</MenuItem>)}
                {unavailableAccountId && <MenuItem value={unavailableAccountId}>Unavailable account ({unavailableAccountId})</MenuItem>}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="transaction-category-label">Category</InputLabel>
              <Select labelId="transaction-category-label" label="Category" value={form.categoryId} onChange={(event) => updateForm('categoryId', event.target.value)}>
                {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="transaction-type-label">Transaction type</InputLabel>
              <Select labelId="transaction-type-label" label="Transaction type" value={form.transactionType} onChange={(event) => updateForm('transactionType', event.target.value as TransactionType)}>
                {transactionTypes.map((type) => <MenuItem key={type} value={type}>{transactionTypeLabels[type]}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Amount" type="number" value={form.amount} onChange={(event) => updateForm('amount', Number(event.target.value))} slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} required fullWidth />
            <TextField label="Description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} slotProps={{ htmlInput: { maxLength: 255 } }} required fullWidth />
            <TextField label="Transaction date" type="date" value={form.transactionDate} onChange={(event) => updateForm('transactionDate', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Delete transaction?</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this transaction?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice('')} message={notice} />
    </Stack>
  )
}
