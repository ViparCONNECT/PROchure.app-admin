import { useAuthStore } from '@/store/auth.store';
import type { AdminRole } from '@/api/types';

export function useAuth() {
  const { user, accessToken, clearSession } = useAuthStore();

  const hasRole = (...roles: AdminRole[]) => !!user && roles.includes(user.role);
  const isSuperAdmin = () => user?.role === 'SUPER_ADMIN';

  return {
    user,
    isAuthenticated: !!accessToken,
    hasRole,
    isSuperAdmin,
    clearSession,
  };
}
