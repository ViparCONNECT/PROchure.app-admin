import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  ApiResponse,
  Category,
  CategoryListParams,
  CreateCategoryDto,
  CreateSubCategoryDto,
  RawPaginatedPayload,
  SubCategory,
  UpdateCategoryDto,
  UpdateSubCategoryDto,
} from './types';

const CATEGORIES_KEY = 'categories';
const SUBCATEGORIES_KEY = 'subcategories';

// ─── Category API ──────────────────────────────────────────────────────────────

export async function fetchCategories(params: CategoryListParams = {}) {
  const { data } = await apiClient.get<ApiResponse<RawPaginatedPayload<Category>>>('/categories', { params });
  return data.data.data;
}

export async function fetchCategory(id: string) {
  const { data } = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
  return data.data;
}

export async function updateCategory(id: string, dto: UpdateCategoryDto) {
  const { data } = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, dto);
  return data.data;
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`/categories/${id}`);
}

// ─── SubCategory API ──────────────────────────────────────────────────────────

export async function fetchSubCategories(categoryId: string) {
  const { data } = await apiClient.get<ApiResponse<RawPaginatedPayload<SubCategory> | SubCategory[]>>(
    `/categories/${categoryId}/subcategories`,
  );
  const result = data.data;
  // handle both bare array and paginated envelope
  return Array.isArray(result) ? result : result.data;
}

export async function createSubCategory(categoryId: string, dto: CreateSubCategoryDto) {
  const { data } = await apiClient.post<ApiResponse<SubCategory>>(
    `/categories/${categoryId}/subcategories`,
    dto,
  );
  return data.data;
}

export async function updateSubCategory(id: string, dto: UpdateSubCategoryDto) {
  const { data } = await apiClient.patch<ApiResponse<SubCategory>>(`/subcategories/${id}`, dto);
  return data.data;
}

export async function deleteSubCategory(id: string) {
  await apiClient.delete(`/subcategories/${id}`);
}

// ─── Category hooks ────────────────────────────────────────────────────────────

export function useCategories(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, params],
    queryFn: () => fetchCategories(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, id],
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) => updateCategory(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

// ─── SubCategory hooks ─────────────────────────────────────────────────────────

export function useSubCategories(categoryId: string) {
  return useQuery({
    queryKey: [SUBCATEGORIES_KEY, categoryId],
    queryFn: () => fetchSubCategories(categoryId),
    enabled: !!categoryId,
  });
}

export function useCreateSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, dto }: { categoryId: string; dto: CreateSubCategoryDto }) =>
      createSubCategory(categoryId, dto),
    onSuccess: (_data, { categoryId }) =>
      qc.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY, categoryId] }),
  });
}

export function useUpdateSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSubCategoryDto }) =>
      updateSubCategory(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] }),
  });
}

export function useDeleteSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSubCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] }),
  });
}

// ─── Create category (was unused placeholder) ────────────────────────────────

export async function createCategory(dto: CreateCategoryDto) {
  const { data } = await apiClient.post<ApiResponse<Category>>('/categories', dto);
  return data.data;
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}
