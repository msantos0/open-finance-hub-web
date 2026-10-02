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
import { investmentService } from '../services/investmentService'
import { investmentTypes, type InvestmentRequest, type InvestmentResponse, type InvestmentType } from '../types/investment'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const rateFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

const emptyForm: InvestmentRequest = {
  type: 'CDB',
  institution: '',
  description: '',
  investedAmount: 0,
  currentValue: 0,
  annualRate: 0,
  applicationDate: new Date().toISOString().slice(0, 10),
  maturityDate: null,
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback

  const response = error.response
  if (typeof response !== 'object' || response === null || !('data' in response)) return fallback

  const data = response.data
  if (typeof data !== 'object' || data === null) return fallback
  if ('validationErrors' in data && typeof data.validationErrors === 'object' && data.validationErrors !== null) {
    const validationMessages = Object.values(data.validationErrors).filter((message): message is string => typeof message === 'string')
    if (validationMessages.length > 0) return validationMessages.join(' ')
  }
  if ('message' in data && typeof data.message === 'string') return data.message
  return fallback
}

function formatDate(date: string | null) {
  if (!date) return '-'
  const parsedDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString('en-US')
}

export function InvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<InvestmentResponse | null>(null)
  const [editingInvestment, setEditingInvestment] = useState<InvestmentResponse | null>(null)
  const [form, setForm] = useState<InvestmentRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  const loadInvestments = async () => {
    setLoading(true)
    setError('')
    try {
      setInvestments(await investmentService.getAll())
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load investments.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInvestments()
  }, [])

  const openCreateDialog = () => {
    setEditingInvestment(null)
    setForm({ ...emptyForm, applicationDate: new Date().toISOString().slice(0, 10) })
    setFormError('')
    setDialogOpen(true)
  }

  const openEditDialog = (investment: InvestmentResponse) => {
    setEditingInvestment(investment)
    setForm({
      type: investment.type,
      institution: investment.institution,
      description: investment.description,
      investedAmount: investment.investedAmount,
      currentValue: investment.currentValue,
      annualRate: investment.annualRate,
      applicationDate: investment.applicationDate,
      maturityDate: investment.maturityDate ?? null,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const updateForm = <K extends keyof InvestmentRequest>(field: K, value: InvestmentRequest[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validateForm = () => {
    if (!form.institution.trim()) return 'Institution is required.'
    if (!Number.isFinite(form.investedAmount) || form.investedAmount <= 0) return 'Invested amount must be greater than zero.'
    if (!Number.isFinite(form.currentValue) || form.currentValue < 0) return 'Current value must be zero or greater.'
    if (!Number.isFinite(form.annualRate) || form.annualRate < 0) return 'Annual rate must be zero or greater.'
    if (!form.applicationDate) return 'Application date is required.'
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
    const payload = {
      ...form,
      institution: form.institution.trim(),
      description: form.description.trim(),
    }

    try {
      if (editingInvestment) {
        await investmentService.update(editingInvestment.id, payload)
        setNotice('Investment updated successfully.')
      } else {
        await investmentService.create(payload)
        setNotice('Investment created successfully.')
      }
      setDialogOpen(false)
      await loadInvestments()
    } catch (saveError) {
      setFormError(getErrorMessage(saveError, 'Unable to save this investment.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await investmentService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setNotice('Investment deleted successfully.')
      await loadInvestments()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete this investment.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Investments</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage your investment portfolio.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>New investment</Button>
      </Stack>

      {error && <Alert severity="error" icon={<ErrorOutlined />}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}><CircularProgress /></Box>
      ) : investments.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>No investments yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Add your first investment to start tracking your portfolio.</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={openCreateDialog}>New investment</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 1100 }} aria-label="Investments table">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Invested amount</TableCell>
                <TableCell align="right">Current value</TableCell>
                <TableCell align="right">Annual rate</TableCell>
                <TableCell>Application date</TableCell>
                <TableCell>Maturity date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investments.map((investment) => (
                <TableRow key={investment.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{investment.type}</TableCell>
                  <TableCell>{investment.institution}</TableCell>
                  <TableCell>{investment.description || '-'}</TableCell>
                  <TableCell align="right">{currency.format(investment.investedAmount)}</TableCell>
                  <TableCell align="right">{currency.format(investment.currentValue)}</TableCell>
                  <TableCell align="right">{rateFormatter.format(investment.annualRate)}%</TableCell>
                  <TableCell>{formatDate(investment.applicationDate)}</TableCell>
                  <TableCell>{formatDate(investment.maturityDate)}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label={`Edit investment at ${investment.institution}`} onClick={() => openEditDialog(investment)}><EditOutlined /></IconButton>
                    <IconButton aria-label={`Delete investment at ${investment.institution}`} color="error" onClick={() => setDeleteTarget(investment)}><DeleteOutlined /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingInvestment ? 'Edit investment' : 'New investment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormControl fullWidth required>
              <InputLabel id="investment-type-label">Type</InputLabel>
              <Select
                labelId="investment-type-label"
                label="Type"
                value={form.type}
                onChange={(event) => updateForm('type', event.target.value as InvestmentType)}
              >
                {investmentTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Institution" value={form.institution} onChange={(event) => updateForm('institution', event.target.value)} required fullWidth />
            <TextField label="Description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} fullWidth />
            <TextField label="Invested amount" type="number" value={form.investedAmount} onChange={(event) => updateForm('investedAmount', Number(event.target.value))} slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} required fullWidth />
            <TextField label="Current value" type="number" value={form.currentValue} onChange={(event) => updateForm('currentValue', Number(event.target.value))} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} required fullWidth />
            <TextField label="Annual rate (%)" type="number" value={form.annualRate} onChange={(event) => updateForm('annualRate', Number(event.target.value))} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} required fullWidth />
            <TextField label="Application date" type="date" value={form.applicationDate} onChange={(event) => updateForm('applicationDate', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth />
            <TextField label="Maturity date" type="date" value={form.maturityDate ?? ''} onChange={(event) => updateForm('maturityDate', event.target.value || null)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Delete investment?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this investment?</Typography>
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