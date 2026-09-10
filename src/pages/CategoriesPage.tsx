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
import { categoryService } from '../services/categoryService'
import { categoryTypes, type Category, type CategoryRequest, type CategoryType } from '../types/category'

const emptyForm: CategoryRequest = {
  name: '',
  description: '',
  type: 'EXPENSE',
}

const categoryTypeLabels: Record<CategoryType, string> = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
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

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    setError('')
    try {
      setCategories(await categoryService.getAll())
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load categories.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const openCreateDialog = () => {
    setEditingCategory(null)
    setForm(emptyForm)
    setFormError('')
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description ?? '',
      type: category.type,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const updateForm = <K extends keyof CategoryRequest>(field: K, value: CategoryRequest[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required.'
    if (form.name.trim().length > 100) return 'Name must have at most 100 characters.'
    if (form.description.length > 500) return 'Description must have at most 500 characters.'
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
      name: form.name.trim(),
      description: form.description.trim(),
    }

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload)
        setNotice('Category updated successfully.')
      } else {
        await categoryService.create(payload)
        setNotice('Category created successfully.')
      }
      setDialogOpen(false)
      await loadCategories()
    } catch (saveError) {
      setFormError(getErrorMessage(saveError, 'Unable to save this category.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await categoryService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setNotice('Category deleted successfully.')
      await loadCategories()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete this category.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Categories</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Organize your income and expenses.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>New category</Button>
      </Stack>

      {error && <Alert severity="error" icon={<ErrorOutlined />}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}><CircularProgress /></Box>
      ) : categories.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>No categories yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Create your first category to organize your finances.</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={openCreateDialog}>New category</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 620 }} aria-label="Categories table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{category.name}</TableCell>
                  <TableCell>{categoryTypeLabels[category.type]}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label={`Edit ${category.name}`} onClick={() => openEditDialog(category)}><EditOutlined /></IconButton>
                    <IconButton aria-label={`Delete ${category.name}`} color="error" onClick={() => setDeleteTarget(category)}><DeleteOutlined /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingCategory ? 'Edit category' : 'New category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Name"
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel id="category-type-label">Type</InputLabel>
              <Select
                labelId="category-type-label"
                label="Type"
                value={form.type}
                onChange={(event) => updateForm('type', event.target.value as CategoryType)}
              >
                {categoryTypes.map((type) => <MenuItem key={type} value={type}>{categoryTypeLabels[type]}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Delete category?</DialogTitle>
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
