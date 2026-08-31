import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/api/categories';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageError } from '@/components/common/ErrorDisplay';
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryFormValues,
  type UpdateCategoryFormValues,
} from '@/schemas/category.schema';
import { parseApiError } from '@/utils/api-error';
import type { Category } from '@/api/types';

const TYPE_OPTIONS = [
  { value: 'PROFESSIONAL_CONSULTANT', label: 'Professional Consultant' },
  { value: 'SERVICE_BRANDS', label: 'Service Brands' },
  { value: 'PRODUCT_BRANDS', label: 'Product Brands' },
  { value: 'RETAIL_BRANDS', label: 'Retail Brands' },
] as const;

export function CategoriesPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: categories, isLoading, error, refetch } = useCategories({
    search: search || undefined,
    type: typeFilter || undefined,
  });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // ── Create form ────────────────────────────────────────────────────────────────────────
  const {
    register: regCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    setValue: setCreateValue,
    watch: watchCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { isSubCategoryNeeded: false },
  });

  const createIsSubNeeded = watchCreate('isSubCategoryNeeded');

  const onCreateSubmit = async (values: CreateCategoryFormValues) => {
    try {
      await createCategory.mutateAsync(values);
      enqueueSnackbar('Category created.', { variant: 'success' });
      setCreateOpen(false);
      resetCreate();
    } catch (err) {
      enqueueSnackbar(parseApiError(err).message, { variant: 'error' });
    }
  };

  // ── Edit form ────────────────────────────────────────────────────────────────────────
  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    watch: watchEdit,
    formState: { errors: editErrors, isSubmitting: isEditing },
  } = useForm<UpdateCategoryFormValues>({ resolver: zodResolver(updateCategorySchema) });

  const editIsSubNeeded = watchEdit('isSubCategoryNeeded');

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    resetEdit({ name: cat.name, isSubCategoryNeeded: cat.isSubCategoryNeeded });
  };

  const onEditSubmit = async (values: UpdateCategoryFormValues) => {
    if (!editTarget) return;
    try {
      await updateCategory.mutateAsync({ id: editTarget.id, dto: values });
      enqueueSnackbar('Category updated.', { variant: 'success' });
      setEditTarget(null);
    } catch (err) {
      enqueueSnackbar(parseApiError(err).message, { variant: 'error' });
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Category deleted.', { variant: 'success' });
    } catch (err) {
      const parsed = parseApiError(err);
      enqueueSnackbar(
        parsed.status === 409
          ? 'Cannot delete: profiles are assigned to this category.'
          : parsed.message,
        { variant: parsed.status === 409 ? 'warning' : 'error' },
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <PageError message={parseApiError(error).message} onRetry={refetch} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New Category
        </Button>
      </Box>

      {/* ── Filter bar ──────────────────────────────────────────────────────────────── */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}
        >
          <TextField
            size="small"
            placeholder="Search categories…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 210 }}
          >
            <MenuItem value="">All Types</MenuItem>
            {TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="outlined" size="small">Search</Button>
          <Button
            size="small"
            onClick={() => { setSearch(''); setSearchInput(''); setTypeFilter(''); }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
        {(categories ?? []).map((cat) => (
          <Card key={cat.id}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h6">{cat.name}</Typography>
                  <Chip label={cat.type} size="small" variant="outlined" />
                  {!cat.isSubCategoryNeeded && (
                    <Chip label="No Sub-Category" size="small" color="default" />
                  )}
                </Box>
              }
              action={
                <Box>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(cat)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(cat)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Button
                size="small"
                startIcon={<AccountTreeIcon />}
                onClick={() => navigate(`/categories/${cat.id}/subcategories`)}
              >
                {cat.isSubCategoryNeeded ? 'Manage Sub-Categories' : 'View Sub-Categories'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* ── Create Dialog ────────────────────────────────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); resetCreate(); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            component="form"
            id="create-category-form"
            onSubmit={handleCreateSubmit(onCreateSubmit)}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}
          >
            <TextField
              {...regCreate('name')}
              label="Display Name"
              fullWidth
              required
              autoFocus
              error={!!createErrors.name}
              helperText={createErrors.name?.message}
            />
            <TextField
              {...regCreate('type')}
              select
              label="Type"
              fullWidth
              required
              defaultValue=""
              error={!!createErrors.type}
              helperText={createErrors.type?.message}
            >
              {TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={createIsSubNeeded ?? false}
                  onChange={(e) => setCreateValue('isSubCategoryNeeded', e.target.checked)}
                />
              }
              label="Requires Sub-Category"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setCreateOpen(false); resetCreate(); }}>Cancel</Button>
          <Button
            type="submit"
            form="create-category-form"
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Dialog ─────────────────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit — {editTarget?.name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            component="form"
            id="edit-category-form"
            onSubmit={handleEditSubmit(onEditSubmit)}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}
          >
            <TextField
              {...regEdit('name')}
              label="Display Name"
              fullWidth
              error={!!editErrors.name}
              helperText={editErrors.name?.message}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editIsSubNeeded ?? editTarget?.isSubCategoryNeeded ?? false}
                  onChange={(e) => setEditValue('isSubCategoryNeeded', e.target.checked)}
                />
              }
              label="Requires Sub-Category"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)}>Cancel</Button>
          <Button
            type="submit"
            form="edit-category-form"
            variant="contained"
            disabled={isEditing}
          >
            {isEditing ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone. Deletion is blocked if any profiles are assigned to this category.`}
        confirmLabel="Delete"
        loading={deleteCategory.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

export default CategoriesPage;
