import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import {
  useCategoryGroups,
  useCreateCategoryGroup,
  useDeleteCategoryGroup,
  useUpdateCategoryGroup,
} from '@/api/categoryGroups';
import type { CategoryGroup, CategoryType } from '@/api/types';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageError } from '@/components/common/ErrorDisplay';
import { PROFILE_TYPE_LABEL, PROFILE_TYPE_OPTIONS } from '@/profile-kit/constants';
import { parseApiError } from '@/utils/api-error';

interface FormState {
  name: string;
  type: CategoryType | '';
  sortOrder: string;
}

const EMPTY: FormState = { name: '', type: '', sortOrder: '0' };

/** Manage "Category Types" — the headings categories are grouped under (per profile type). */
export function CategoryTypesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [typeFilter, setTypeFilter] = useState<CategoryType | ''>('');
  const { data: groups, isLoading, error, refetch } = useCategoryGroups(typeFilter || undefined);
  const createGroup = useCreateCategoryGroup();
  const updateGroup = useUpdateCategoryGroup();
  const deleteGroup = useDeleteCategoryGroup();

  const [editing, setEditing] = useState<CategoryGroup | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryGroup | null>(null);

  const open = (g: CategoryGroup | 'new') => {
    setEditing(g);
    setFormError(null);
    setForm(g === 'new' ? { ...EMPTY, type: typeFilter } : { name: g.name, type: g.type, sortOrder: String(g.sortOrder) });
  };

  const save = async () => {
    const name = form.name.trim();
    const sortOrder = Number(form.sortOrder || 0);
    if (!name) return setFormError('Name is required');
    if (!form.type) return setFormError('Profile type is required');
    if (!Number.isInteger(sortOrder) || sortOrder < 0) return setFormError('Order must be a whole number (0 or more)');
    try {
      if (editing === 'new') await createGroup.mutateAsync({ name, type: form.type, sortOrder });
      else if (editing) await updateGroup.mutateAsync({ id: editing.id, dto: { name, sortOrder } });
      enqueueSnackbar(editing === 'new' ? 'Category type created.' : 'Category type updated.', { variant: 'success' });
      setEditing(null);
    } catch (err) {
      setFormError(parseApiError(err).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGroup.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Category type deleted.', { variant: 'success' });
    } catch (err) {
      const parsed = parseApiError(err);
      enqueueSnackbar(parsed.message, { variant: parsed.status === 409 ? 'warning' : 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (error) return <PageError message={parseApiError(error).message} onRetry={refetch} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Category Types
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => open('new')}>
          New Category Type
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Categories are grouped under these headings in the app and in the profile form. Lower order numbers are shown
        first.
      </Typography>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          select
          size="small"
          label="Profile Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as CategoryType | '')}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="">All Profile Types</MenuItem>
          {PROFILE_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      <TableContainer component={Paper}>
        <Table aria-label="Category types">
          <TableHead>
            <TableRow>
              <TableCell>Category Type</TableCell>
              <TableCell>Profile Type</TableCell>
              <TableCell align="center">Order</TableCell>
              <TableCell align="center">Categories</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !groups?.length ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No category types yet.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {g.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={PROFILE_TYPE_LABEL[g.type]} size="small" variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell align="center">{g.sortOrder}</TableCell>
                  <TableCell align="center">{g._count?.categories ?? 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => open(g)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={g._count?.categories ? 'Move its categories to another type first' : 'Delete'}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!!g._count?.categories}
                          onClick={() => setDeleteTarget(g)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing === 'new' ? 'New Category Type' : 'Edit Category Type'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              required
              autoFocus
              fullWidth
              value={form.name}
              inputProps={{ maxLength: 120 }}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Licenced Practitioners / Statutory Professionals"
            />
            <TextField
              select
              label="Profile Type"
              required
              fullWidth
              disabled={editing !== 'new'}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CategoryType }))}
              helperText={editing !== 'new' ? 'The profile type cannot be changed' : undefined}
            >
              {PROFILE_TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Display order"
              type="number"
              fullWidth
              value={form.sortOrder}
              inputProps={{ min: 0 }}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              helperText="Lower numbers are listed first"
            />
            {formError && (
              <Typography variant="body2" color="error">
                {formError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={createGroup.isPending || updateGroup.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category type?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteGroup.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

export default CategoryTypesPage;
