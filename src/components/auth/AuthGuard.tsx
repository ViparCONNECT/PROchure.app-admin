import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/auth.store';
import { refreshSession } from '@/api/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { accessToken, isInitializing, setSession, clearSession, setInitializing } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (accessToken) {
      setInitializing(false);
      return;
    }
    // try to restore session via httpOnly refresh-token cookie
    refreshSession()
      .then(({ accessToken: token, user }) => setSession(token, user))
      .catch(() => clearSession());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isInitializing) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;
