import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  AdminListParams,
  AdminUser,
  ApiResponse,
  CreateAdminDto,
  RawPaginatedPayload,
  UpdateAdminDto,
} from './types';

const ADMINS_KEY = 'admins';

// ─── API functions ─────────────────────────────────────────────────────────────

export async function fetchAdmins(params: AdminListParams = {}) {
  const { data } = await apiClient.get<ApiResponse<RawPaginatedPayload<AdminUser>>>('/admins', { params });
  return { items: data.data.data, ...data.data.meta };
}

export async function fetchAdmin(id: string) {
  const { data } = await apiClient.get<ApiResponse<AdminUser>>(`/admins/${id}`);
  return data.data;
}

export async function createAdmin(dto: CreateAdminDto) {
  const { data } = await apiClient.post<ApiResponse<AdminUser>>('/admins', dto);
  return data.data;
}

export async function updateAdmin(id: string, dto: UpdateAdminDto) {
  const { data } = await apiClient.patch<ApiResponse<AdminUser>>(`/admins/${id}`, dto);
  return data.data;
}

export async function deleteAdmin(id: string) {
  await apiClient.delete(`/admins/${id}`);
}

// ─── Query / Mutation hooks ────────────────────────────────────────────────────

export function useAdmins(params: AdminListParams = {}) {
  return useQuery({
    queryKey: [ADMINS_KEY, params],
    queryFn: () => fetchAdmins(params),
  });
}

export function useAdmin(id: string) {
  return useQuery({
    queryKey: [ADMINS_KEY, id],
    queryFn: () => fetchAdmin(id),
    enabled: !!id,
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMINS_KEY] }),
  });
}

export function useUpdateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAdminDto }) => updateAdmin(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [ADMINS_KEY] });
      qc.invalidateQueries({ queryKey: [ADMINS_KEY, id] });
    },
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMINS_KEY] }),
  });
}
