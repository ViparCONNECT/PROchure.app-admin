import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSnackbar } from 'notistack';
import { useAdmins, useDeleteAdmin } from '@/api/admins';
import { useRequestPasswordReset } from '@/api/auth';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { PageError } from '@/components/common/ErrorDisplay';
import { useTablePreferences } from '@/hooks/useTablePreferences';
import { parseApiError } from '@/utils/api-error';
import { formatDateTime } from '@/utils/formatters';
import type { AdminUser } from '@/api/types';

export function AdminsPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { get: getPrefs, set: setPrefs } = useTablePreferences('admins');

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(getPrefs().limit);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Action menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  // Confirm dialogs
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);

  const { data, isLoading, error, refetch } = useAdmins({ page: page + 1, limit, search });
  const deleteAdmin = useDeleteAdmin();
  const requestReset = useRequestPasswordReset();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, admin: AdminUser) => {
    setMenuAnchor(e.currentTarget);
    setSelectedAdmin(admin);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    try {
      await deleteAdmin.mutateAsync(selectedAdmin.id);
      enqueueSnackbar('Admin account deactivated.', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(parseApiError(err).message, { variant: 'error' });
    } finally {
      setDeleteDialog(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedAdmin) return;
    try {
      await requestReset.mutateAsync({ email: selectedAdmin.email });
      enqueueSnackbar('Password reset initiated. Instructions sent.', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(parseApiError(err).message, { variant: 'error' });
    } finally {
      setResetDialog(false);
    }
  };

  if (error) {
    return <PageError message={parseApiError(error).message} onRetry={refetch} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Admins
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admins/new')}>
          New Admin
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="outlined" size="small">
            Search
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table aria-label="Admins table">
          <TableHead>
            <TableRow>
              <TableCell>Name / Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !data?.items?.length ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState message="No admins found" />
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {[admin.firstName, admin.lastName].filter(Boolean).join(' ') || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {admin.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.role.replace('_', ' ')}
                      size="small"
                      color={admin.role === 'SUPER_ADMIN' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={admin.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDateTime(admin.lastLoginAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDateTime(admin.createdAt)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => openMenu(e, admin)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            const ps = Number(e.target.value);
            setLimit(ps);
            setPrefs({ limit: ps });
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Actions menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu();
            navigate(`/admins/${selectedAdmin!.id}/edit`);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            setResetDialog(true);
          }}
        >
          Reset Password
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            closeMenu();
            setDeleteDialog(true);
          }}
        >
          Deactivate / Delete
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={deleteDialog}
        title="Delete admin account?"
        message={`This will permanently deactivate ${selectedAdmin?.email}. They will no longer be able to sign in.`}
        confirmLabel="Delete"
        loading={deleteAdmin.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
      />

      <ConfirmDialog
        open={resetDialog}
        title="Reset admin password?"
        message={`A password reset will be initiated for ${selectedAdmin?.email}. They will receive instructions to set a new password.`}
        confirmLabel="Send Reset"
        confirmColor="primary"
        loading={requestReset.isPending}
        onConfirm={handlePasswordReset}
        onCancel={() => setResetDialog(false)}
      />
    </Box>
  );
}

export default AdminsPage;
