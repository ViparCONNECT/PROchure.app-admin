import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  ApiResponse,
  CreateProfileDto,
  Profile,
  ProfileListParams,
  RawPaginatedPayload,
  UpdateProfileDto,
} from './types';

const PROFILES_KEY = 'profiles';

// ─── API functions ─────────────────────────────────────────────────────────────

export async function fetchProfiles(params: ProfileListParams = {}) {
  const { data } = await apiClient.get<ApiResponse<RawPaginatedPayload<Profile>>>('/profiles', { params });
  return { items: data.data.data, ...data.data.meta };
}

export async function fetchProfile(id: string) {
  const { data } = await apiClient.get<ApiResponse<Profile>>(`/profiles/${id}`);
  return data.data;
}

export async function createProfile(dto: CreateProfileDto) {
  const { data } = await apiClient.post<ApiResponse<Profile>>('/profiles', dto);
  return data.data;
}

export async function updateProfile(id: string, dto: UpdateProfileDto) {
  const { data } = await apiClient.patch<ApiResponse<Profile>>(`/profiles/${id}`, dto);
  return data.data;
}

export async function deleteProfile(id: string) {
  await apiClient.delete(`/profiles/${id}`);
}

// ─── Query / Mutation hooks ────────────────────────────────────────────────────

export function useProfiles(params: ProfileListParams = {}) {
  return useQuery({
    queryKey: [PROFILES_KEY, params],
    queryFn: () => fetchProfiles(params),
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: [PROFILES_KEY, id],
    queryFn: () => fetchProfile(id),
    enabled: !!id,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILES_KEY] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProfileDto }) => updateProfile(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [PROFILES_KEY] });
      qc.invalidateQueries({ queryKey: [PROFILES_KEY, id] });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILES_KEY] }),
  });
}
