import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from '@mui/icons-material/Person';
import { useAdmins } from '@/api/admins';
import { useCategories, useSubCategories } from '@/api/categories';
import { useProfiles } from '@/api/profiles';
import { useAuth } from '@/hooks/useAuth';
import { parseApiError } from '@/utils/api-error';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  error?: string;
}

function StatCard({ label, value, icon, color, loading, error }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <Box
          sx={{
            bgcolor: color,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {loading ? <CircularProgress size={28} /> : error ? '—' : value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// Always call exactly 4 hooks so the count never changes between renders
function useSubcategoryTotal(categoryIds: string[]) {
  const q0 = useSubCategories(categoryIds[0] ?? '');
  const q1 = useSubCategories(categoryIds[1] ?? '');
  const q2 = useSubCategories(categoryIds[2] ?? '');
  const q3 = useSubCategories(categoryIds[3] ?? '');
  const queries = [q0, q1, q2, q3];
  const total = queries.reduce((sum, q) => sum + (q.data?.length ?? 0), 0);
  const isLoading = queries.some((q) => q.isLoading);
  return { total, isLoading };
}

export function DashboardPage() {
  const { isSuperAdmin } = useAuth();

  const adminsQuery = useAdmins({ limit: 1 });
  const categoriesQuery = useCategories();
  const profilesQuery = useProfiles({ limit: 1 });

  const categoryIds = (categoriesQuery.data ?? []).map((c) => c.id);
  const { total: subcategoryTotal, isLoading: subcatsLoading } = useSubcategoryTotal(categoryIds);

  const adminError = adminsQuery.error ? parseApiError(adminsQuery.error).message : undefined;
  const profileError = profilesQuery.error ? parseApiError(profilesQuery.error).message : undefined;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {isSuperAdmin() && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Active Admins"
              value={adminsQuery.data?.total ?? 0}
              icon={<PeopleIcon />}
              color="#1A3C6E"
              loading={adminsQuery.isLoading}
              error={adminError}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Categories"
            value={categoriesQuery.data?.length ?? 0}
            icon={<CategoryIcon />}
            color="#0891B2"
            loading={categoriesQuery.isLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Sub-Categories"
            value={subcategoryTotal}
            icon={<AccountTreeIcon />}
            color="#059669"
            loading={subcatsLoading || categoriesQuery.isLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Profiles"
            value={profilesQuery.data?.total ?? 0}
            icon={<PersonIcon />}
            color="#D97706"
            loading={profilesQuery.isLoading}
            error={profileError}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
