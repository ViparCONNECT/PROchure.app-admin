import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { useCategory, useSubCategories, useCreateSubCategory, useUpdateSubCategory, useDeleteSubCategory } from '@/api/categories';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { PageError } from '@/components/common/ErrorDisplay';
import { createSubCategorySchema, type CreateSubCategoryFormValues } from '@/schemas/category.schema';
import { parseApiError } from '@/utils/api-error';
import { formatDateTime } from '@/utils/formatters';
import type { SubCategory } from '@/api/types';

export function SubcategoriesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: category } = useCategory(categoryId!);
  const { data: subcategories, isLoading, error, refetch } = useSubCategories(categoryId!);

  const createSubCat = useCreateSubCategory();
  const updateSubCat = useUpdateSubCategory();
  const deleteSubCat = useDeleteSubCategory();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SubCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubCategory | null>(null);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSubCategoryFormValues>({
    resolver: zodResolver(createSubCategorySchema),
  });

  const handleCreate = async (values: CreateSubCategoryFormValues) => {
    try {
      await createSubCat.mutateAsync({ categoryId: categoryId!, dto: values });
      enqueueSnackbar('Sub-category created.', { variant: 'success' });
      setAddOpen(false);
      reset();
    } catch (err) {
      enqueueSnackbar(parseApiError(err).message, { variant: 'error' });
    }
  };

  const handleUpdate = async (values: CreateSubCategoryFormValues) => {
    if (!editTarget) return;
    try {
      await updateSubCat.mutateAsync({ id: editTarget.id, dto: values });
      enqueueSnackbar('Sub-category updated.', { variant: 'success' });
      setEditTarget(null);
      reset();
    } catch (err) {
      enqueueSnackbar(parseApiError(err).message, { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubCat.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Sub-category deleted.', { variant: 'success' });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 409) {
        enqueueSnackbar('Cannot delete: profiles are assigned to this sub-category.', {
          variant: 'warning',
        });
      } else {
        enqueueSnackbar(parsed.message, { variant: 'error' });
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  if (error) {
    return <PageError message={parseApiError(error).message} onRetry={refetch} />;
  }

  const catName = category ? category.name : 'Category';

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/categories')}
        sx={{ mb: 2 }}
      >
        Back to Categories
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Sub-Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {catName}
          </Typography>
        </Box>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { reset(); setAddOpen(true); }}
          >
            Add Sub-Category
          </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search sub-categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table aria-label="Sub-categories table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !subcategories?.length ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <EmptyState
                    message="No sub-categories yet"
                    action={{ label: 'Add Sub-Category', onClick: () => setAddOpen(true) }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              subcategories
                .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))
                .map((sub) => (
                <TableRow key={sub.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {sub.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDateTime(sub.createdAt)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => { reset({ name: sub.name }); setEditTarget(sub); }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(sub)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit dialog */}
      <Dialog
        open={addOpen || Boolean(editTarget)}
        onClose={() => { setAddOpen(false); setEditTarget(null); reset(); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{editTarget ? 'Edit Sub-Category' : 'New Sub-Category'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            component="form"
            id="subcategory-form"
            onSubmit={handleSubmit(editTarget ? handleUpdate : handleCreate)}
            noValidate
          >
            <TextField
              {...register('name')}
              label="Name"
              fullWidth
              required
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setAddOpen(false); setEditTarget(null); reset(); }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="subcategory-form"
            variant="contained"
            disabled={isSubmitting}
          >
            {editTarget ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete sub-category?"
        message={`Delete "${deleteTarget?.name}"? If any profiles are assigned to it, this will be blocked.`}
        confirmLabel="Delete"
        loading={deleteSubCat.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

export default SubcategoriesPage;
