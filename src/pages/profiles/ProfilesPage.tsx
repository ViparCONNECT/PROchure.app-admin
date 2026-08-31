import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { useProfiles, useDeleteProfile } from '@/api/profiles';
import { useCategories, useSubCategories } from '@/api/categories';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { PageError } from '@/components/common/ErrorDisplay';
import { useTablePreferences } from '@/hooks/useTablePreferences';
import { parseApiError } from '@/utils/api-error';
import { formatDateTime } from '@/utils/formatters';
import type { Profile, ProfileListParams } from '@/api/types';

const PROFILE_TYPE_OPTIONS = [
  { value: 'PROFESSIONAL_CONSULTANT', label: 'Professional Consultant' },
  { value: 'SERVICE_BRANDS', label: 'Service Brands' },
  { value: 'PRODUCT_BRANDS', label: 'Product Brands' },
  { value: 'RETAIL_BRANDS', label: 'Retail Brands' },
];

const PROFILE_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  PROFILE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export function ProfilesPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { get: getPrefs, set: setPrefs } = useTablePreferences('profiles');

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(getPrefs().limit);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [profileType, setProfileType] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  const params: ProfileListParams = {
    page: page + 1,
    limit,
    search: search || undefined,
    categoryId: categoryId || undefined,
    subCategoryId: subCategoryId || undefined,
  };

  const { data, isLoading, error, refetch } = useProfiles(params);
  const { data: categories } = useCategories();
  const { data: subcategories } = useSubCategories(categoryId);
  const deleteProfile = useDeleteProfile();

  const selectedCategory = categories?.find((c) => c.id === categoryId);

  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    setSubCategoryId('');
    setPage(0);
  };

  const handleProfileTypeChange = (val: string) => {
    setProfileType(val);
    setCategoryId('');
    setSubCategoryId('');
    setPage(0);
  };

  // filter categories by selected profile type
  const filteredCategories = profileType
    ? (categories ?? []).filter((c) => c.type === profileType)
    : (categories ?? []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProfile.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Profile deleted.', { variant: 'success' });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 409) {
        enqueueSnackbar('Cannot delete: profile is referenced by other data.', {
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Profiles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/profiles/new')}
        >
          New Profile
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(0); }}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}
        >
          <TextField
            size="small"
            placeholder="Search by name…"
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

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Profile Type</InputLabel>
            <Select
              value={profileType}
              label="Profile Type"
              onChange={(e) => handleProfileTypeChange(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {PROFILE_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              label="Category"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {filteredCategories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCategory?.isSubCategoryNeeded && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sub-Category</InputLabel>
              <Select
                value={subCategoryId}
                label="Sub-Category"
                onChange={(e) => { setSubCategoryId(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                {(subcategories ?? []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button type="submit" variant="outlined" size="small">
            Search
          </Button>
          <Button
            size="small"
            onClick={() => {
              setSearch('');
              setSearchInput('');
              setCategoryId('');
              setSubCategoryId('');
              setProfileType('');
              setPage(0);
            }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table aria-label="Profiles table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Profile Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Sub-Category</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !data?.items?.length ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    message="No profiles found"
                    action={{ label: 'Create Profile', onClick: () => navigate('/profiles/new') }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((profile) => (
                <TableRow key={profile.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {profile.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={PROFILE_TYPE_LABEL[profile.category?.type ?? ''] ?? profile.category?.type ?? '—'}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                    {profile.category ? profile.category.name : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{profile.sub_category?.name ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{profile.address?.cityTown ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={profile.isDisabled ? 'Disabled' : 'Active'}
                      size="small"
                      color={profile.isDisabled ? 'default' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDateTime(profile.createdAt)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/profiles/${profile.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(profile)}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete profile?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone. If the API returns a conflict (409), it means the profile is referenced by other data.`}
        confirmLabel="Delete"
        loading={deleteProfile.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

export default ProfilesPage;
