import { Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuthStore } from '@/store/auth.store';
import type { AdminRole } from '@/api/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AdminRole[];
  fallback?: 'redirect' | 'block';
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = 'block',
}: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback === 'redirect') {
      return <Navigate to="/dashboard" replace />;
    }
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          gap: 2,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography variant="h6" color="text.secondary">
          Access denied
        </Typography>
        <Typography variant="body2" color="text.disabled">
          You do not have permission to view this page.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}

export default RoleGuard;
