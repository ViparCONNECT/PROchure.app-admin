import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from './client';
import type {
  AdminRole,
  AdminUser,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  RefreshResponse,
} from './types';

// ─── JWT helpers ──────────────────────────────────────────────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function userFromToken(token: string): AdminUser {
  const claims = decodeJwtPayload(token);
  return {
    id: String(claims.sub ?? ''),
    email: String(claims.email ?? ''),
    role: String(claims.role ?? 'ADMIN') as AdminRole,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };
}

// ─── API functions ─────────────────────────────────────────────────────────────

export async function login(credentials: LoginRequest) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  const resp = data.data as LoginResponse & { admin?: AdminUser };
  const user = resp.user ?? resp.admin ?? userFromToken(resp.accessToken);
  return { accessToken: resp.accessToken, user };
}

export async function refreshSession() {
  const { data } = await apiClient.post<ApiResponse<RefreshResponse>>('/auth/refresh');
  const resp = data.data as RefreshResponse & { admin?: AdminUser };
  const user = resp.user ?? resp.admin ?? userFromToken(resp.accessToken);
  return { accessToken: resp.accessToken, user };
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function requestPasswordReset(dto: PasswordResetRequestDto) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/admin-password-reset/request',
    dto,
  );
  return data.data;
}

export async function confirmPasswordReset(dto: PasswordResetConfirmDto) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/admin-password-reset/confirm',
    dto,
  );
  return data.data;
}

// ─── Query / Mutation hooks ────────────────────────────────────────────────────

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useLogout() {
  return useMutation({ mutationFn: logout });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset });
}

export function useConfirmPasswordReset() {
  return useMutation({ mutationFn: confirmPasswordReset });
}

export function useSessionRestore() {
  return useQuery({
    queryKey: ['session-restore'],
    queryFn: refreshSession,
    retry: false,
    staleTime: Infinity,
  });
}
