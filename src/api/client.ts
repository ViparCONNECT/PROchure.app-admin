import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type { ApiErrorResponse, RefreshResponse, ApiResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach access token ─────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: refresh once on 401 ───────────────────────────────

interface ExtendedConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as ExtendedConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<ApiResponse<RefreshResponse>>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const resp = data.data as RefreshResponse & { admin?: RefreshResponse['user'] };
        const accessToken = resp.accessToken;
        const rawUser = resp.user ?? resp.admin;
        // decode JWT when refresh endpoint returns only the token
        const user = rawUser ?? (() => {
          try {
            const b64 = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const c = JSON.parse(atob(b64)) as Record<string, unknown>;
            return { id: String(c.sub ?? ''), email: String(c.email ?? ''), role: String(c.role ?? 'ADMIN'), isActive: true, createdAt: '', updatedAt: '' };
          } catch { return null; }
        })();
        if (!user) throw new Error('no user in refresh response');
        useAuthStore.getState().setSession(accessToken, user as import('./types').AdminUser);
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        drainQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        drainQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
