// ─── Roles ────────────────────────────────────────────────────────────────────

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

// ─── Category ─────────────────────────────────────────────────────────────────

export type CategoryType =
  | 'PROFESSIONAL_CONSULTANT'
  | 'SERVICE_BRANDS'
  | 'PRODUCT_BRANDS'
  | 'RETAIL_BRANDS';

export interface Category {
  id: string;
  /** Display name, e.g. "Product Brands" */
  name: string;
  /** Enum identifier, e.g. "PRODUCT_BRANDS" */
  type: CategoryType;
  isSubCategoryNeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  isSubCategoryNeeded?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
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

export interface ProfileAddress {
  buildingMallPropertyName?: string;
  doorShopNo?: string;
  floor?: string;
  streetLaneRoadNameSubLocality?: string;
  nearestLandmark?: string;
  secondaryPrimaryLocality?: string;
  cityTown: string;
  stateProvince: string;
  country: string;
  pinCodeZipCode: string;
}

export interface ProfileContact {
  countryCode?: string;
  officialContactNumber: string;
  officialEmailId: string;
  officialWebsiteApp?: string;
  contactPersonName?: string;
  contactPersonDesignation?: string;
  mostComfortablePreferredLanguages?: string[];
}

export interface WorkingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Profile {
  id: string;
  isDisabled: boolean;
  image?: string;
  logo?: string;
  categoryId: string;
  category?: Pick<Category, 'id' | 'name' | 'type'>;
  subCategoryId?: string;
  sub_category?: Pick<SubCategory, 'id' | 'name'>;
  name: string;
  yearOfEstablishment?: string;
  address: ProfileAddress;
  contact: ProfileContact;
  workingHours?: WorkingHours;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  isDisabled?: boolean;
  image?: string;
  logo?: string;
  categoryId: string;
  subCategoryId?: string;
  name: string;
  yearOfEstablishment?: string;
  address: ProfileAddress;
  contact: ProfileContact;
  workingHours?: WorkingHours;
}

export type UpdateProfileDto = Partial<CreateProfileDto>;

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
}

export interface ProfileListParams extends PaginationParams {
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
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
