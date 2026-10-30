import type { ProfilePayload } from '@/profile-kit/types';

// ─── Roles ────────────────────────────────────────────────────────────────────

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

// ─── Category ─────────────────────────────────────────────────────────────────

export type CategoryType = 'PROFESSIONAL_CONSULTANT' | 'SERVICE_AND_RETAIL_BRANDS';

/** "Category Type" in the UI — groups categories within a profile type. */
export interface CategoryGroup {
  id: string;
  name: string;
  type: CategoryType;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { categories: number };
}

export interface CreateCategoryGroupDto {
  name: string;
  type: CategoryType;
  sortOrder?: number;
}

export interface UpdateCategoryGroupDto {
  name?: string;
  sortOrder?: number;
}

export interface Category {
  id: string;
  /** Display name, e.g. "Product Brands" */
  name: string;
  /** Profile type */
  type: CategoryType;
  groupId?: string | null;
  group?: Pick<CategoryGroup, 'id' | 'name' | 'sortOrder'> | null;
  isSubCategoryNeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  groupId: string;
  isSubCategoryNeeded?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  groupId?: string;
  isSubCategoryNeeded?: boolean;
}

// ─── SubCategory ──────────────────────────────────────────────────────────────

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  category?: Pick<Category, 'id' | 'name' | 'type'>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubCategoryDto {
  name: string;
}

export interface UpdateSubCategoryDto {
  name: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  role: AdminRole;
  firstName?: string;
  lastName?: string;
}

export interface UpdateAdminDto {
  firstName?: string;
  lastName?: string;
  role?: AdminRole;
  isActive?: boolean;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export type ProfileStatus = 'PENDING_PAYMENT' | 'ACTIVE';

export interface ProfileOwner {
  email: string;
  /** E.164, e.g. +919876543210 */
  phone: string;
}

export interface Profile extends Omit<ProfilePayload, 'profileType' | 'subCategoryId' | 'servicesDetail'> {
  id: string;
  status: ProfileStatus;
  isDisabled: boolean;
  subCategoryId?: string | null;
  servicesDetail?: string | null;
  /** Set once the listing fee has been paid */
  paidAt?: string | null;
  paymentLinkToken?: string | null;
  category?: Pick<Category, 'id' | 'name' | 'type' | 'isSubCategoryNeeded' | 'groupId'>;
  subCategory?: Pick<SubCategory, 'id' | 'name'> | null;
  user?: ({ id: string; name: string } & ProfileOwner) | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto extends ProfilePayload {
  isDisabled?: boolean;
  owner: ProfileOwner;
}

export interface UpdateProfileDto extends ProfilePayload {
  isDisabled?: boolean;
  /** Only accepted while the profile has no owner */
  owner?: ProfileOwner;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AdminUser;
}

export interface RefreshResponse {
  accessToken: string;
  user: AdminUser;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  newPassword: string;
}

// ─── API Envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Shape the backend actually sends inside data.data for list endpoints */
export interface RawPaginatedPayload<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface AdminListParams extends PaginationParams {
  search?: string;
}

export interface CategoryListParams extends PaginationParams {
  search?: string;
  type?: string;
  groupId?: string;
}

export interface PaymentLink {
  url: string;
  paid: boolean;
  paidAt?: string | null;
}

export interface ProfileListParams extends PaginationParams {
  search?: string;
  type?: CategoryType;
  categoryId?: string;
  subCategoryId?: string;
  status?: ProfileStatus;
  isDisabled?: boolean;
}

// ─── Form Field Definitions ───────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'radio'
  | 'section'
  | 'imageUpload';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormFieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  default?: unknown;
  options?: SelectOption[];
  source?: string;
  create?: boolean;
  edit?: boolean;
  readOnly?: boolean;
  helpText?: string;
  fields?: FormFieldDefinition[];
  /** S3 folder for imageUpload fields (e.g. 'profiles') */
  uploadFolder?: string;
}
