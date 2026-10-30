import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  ApiResponse,
  CategoryGroup,
  CategoryType,
  CreateCategoryGroupDto,
  UpdateCategoryGroupDto,
} from './types';

const KEY = 'category-groups';

export async function fetchCategoryGroups(type?: CategoryType) {
  const { data } = await apiClient.get<ApiResponse<CategoryGroup[]>>('/category-groups', {
    params: type ? { type } : {},
  });
  return data.data;
}

export async function createCategoryGroup(dto: CreateCategoryGroupDto) {
  const { data } = await apiClient.post<ApiResponse<CategoryGroup>>('/category-groups', dto);
  return data.data;
}

export async function updateCategoryGroup(id: string, dto: UpdateCategoryGroupDto) {
  const { data } = await apiClient.patch<ApiResponse<CategoryGroup>>(`/category-groups/${id}`, dto);
  return data.data;
}

export async function deleteCategoryGroup(id: string) {
  await apiClient.delete(`/category-groups/${id}`);
}

export function useCategoryGroups(type?: CategoryType) {
  return useQuery({ queryKey: [KEY, type ?? 'all'], queryFn: () => fetchCategoryGroups(type) });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [KEY] });
    qc.invalidateQueries({ queryKey: ['categories'] });
  };
}

export function useCreateCategoryGroup() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: createCategoryGroup, onSuccess: invalidate });
}

export function useUpdateCategoryGroup() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryGroupDto }) => updateCategoryGroup(id, dto),
    onSuccess: invalidate,
  });
}

export function useDeleteCategoryGroup() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: deleteCategoryGroup, onSuccess: invalidate });
}
