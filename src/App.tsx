import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminsPage from '@/pages/admins/AdminsPage';
import AdminCreatePage from '@/pages/admins/AdminCreatePage';
import AdminEditPage from '@/pages/admins/AdminEditPage';
import CategoriesPage from '@/pages/categories/CategoriesPage';
import SubcategoriesPage from '@/pages/categories/SubcategoriesPage';
import ProfilesPage from '@/pages/profiles/ProfilesPage';
import ProfileCreatePage from '@/pages/profiles/ProfileCreatePage';
import ProfileEditPage from '@/pages/profiles/ProfileEditPage';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admins — Super Admin only */}
          <Route
            path="/admins"
            element={
              <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                <AdminsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admins/new"
            element={
              <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                <AdminCreatePage />
              </RoleGuard>
            }
          />
          <Route
            path="/admins/:id/edit"
            element={
              <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                <AdminEditPage />
              </RoleGuard>
            }
          />

          {/* Categories */}
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/categories/:categoryId/subcategories"
            element={<SubcategoriesPage />}
          />

          {/* Profiles */}
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/profiles/new" element={<ProfileCreatePage />} />
          <Route path="/profiles/:id/edit" element={<ProfileEditPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
