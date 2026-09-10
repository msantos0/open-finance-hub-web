import { useEffect, useState } from 'react'
import {
  Add,
  CheckCircleOutlined,
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
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
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
import { accountTypes, type Account, type AccountRequest, type AccountType } from '../types/account'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const accountTypeLabels: Record<AccountType, string> = {
  CHECKING: 'Checking',
  SAVINGS: 'Savings',
  INVESTMENT: 'Investment',
  CASH: 'Cash',
  DIGITAL_WALLET: 'Digital wallet',
}

const emptyForm: AccountRequest = {
  name: '',
  bank: '',
  accountType: 'CHECKING',
  initialBalance: 0,
  active: true,
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error.response
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data
      if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
        return data.message
      }
    }
  }
  return fallback
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [form, setForm] = useState<AccountRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  const loadAccounts = async () => {
    setLoading(true)
    setError('')
    try {
      setAccounts(await accountService.getAll())
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load your accounts.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAccounts()
  }, [])

  const openCreateDialog = () => {
    setEditingAccount(null)
    setForm(emptyForm)
    setFormError('')
    setDialogOpen(true)
  }

  const openEditDialog = (account: Account) => {
    setEditingAccount(account)
    setForm({
      name: account.name,
      bank: account.bank,
      accountType: account.accountType,
      initialBalance: account.initialBalance,
      active: account.active,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (!saving) setDialogOpen(false)
  }

  const updateForm = <K extends keyof AccountRequest>(field: K, value: AccountRequest[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validateForm = () => {
    if (!form.name.trim() || form.name.length > 100) return 'Name is required and must have at most 100 characters.'
    if (!form.bank.trim() || form.bank.length > 100) return 'Bank is required and must have at most 100 characters.'
    if (form.initialBalance < 0) return 'Initial balance cannot be negative.'
    return ''
  }

  const handleSave = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError('')
    const payload = { ...form, name: form.name.trim(), bank: form.bank.trim() }
    try {
      if (editingAccount) {
        await accountService.update(editingAccount.id, payload)
        setNotice('Account updated successfully.')
      } else {
        await accountService.create(payload)
        setNotice('Account created successfully.')
      }
      setDialogOpen(false)
      await loadAccounts()
    } catch (saveError) {
      setFormError(getErrorMessage(saveError, 'Unable to save this account.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await accountService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setNotice('Account deleted successfully.')
      await loadAccounts()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete this account.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Accounts</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage your financial accounts.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>New account</Button>
      </Stack>

      {error && <Alert severity="error" icon={<ErrorOutlined />}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}><CircularProgress /></Box>
      ) : accounts.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>No accounts yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Add your first account to start tracking your finances.</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={openCreateDialog}>New account</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 720 }} aria-label="Accounts table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Initial balance</TableCell>
                <TableCell align="right">Current balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{account.name}</TableCell>
                  <TableCell>{account.bank}</TableCell>
                  <TableCell>{accountTypeLabels[account.accountType]}</TableCell>
                  <TableCell align="right">{currency.format(account.initialBalance)}</TableCell>
                  <TableCell align="right">{currency.format(account.currentBalance)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: account.active ? 'success.main' : 'text.secondary' }}>
                      {account.active && <CheckCircleOutlined fontSize="small" />}
                      <Typography variant="body2">{account.active ? 'Active' : 'Inactive'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton aria-label={`Edit ${account.name}`} onClick={() => openEditDialog(account)}><EditOutlined /></IconButton>
                    <IconButton aria-label={`Delete ${account.name}`} color="error" onClick={() => setDeleteTarget(account)}><DeleteOutlined /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingAccount ? 'Edit account' : 'New account'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Name" value={form.name} onChange={(event) => updateForm('name', event.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} required fullWidth />
            <TextField label="Bank" value={form.bank} onChange={(event) => updateForm('bank', event.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} required fullWidth />
            <FormControl fullWidth required>
              <InputLabel id="account-type-label">Account type</InputLabel>
              <Select labelId="account-type-label" label="Account type" value={form.accountType} onChange={(event) => updateForm('accountType', event.target.value as AccountType)}>
                {accountTypes.map((type) => <MenuItem key={type} value={type}>{accountTypeLabels[type]}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Initial balance" type="number" value={form.initialBalance} onChange={(event) => updateForm('initialBalance', Number(event.target.value))} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} required fullWidth />
            <FormControlLabel control={<Switch checked={form.active} onChange={(event) => updateForm('active', event.target.checked)} />} label="Active account" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {deleteTarget?.name}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice('')} message={notice} />
    </Stack>
  )
}
