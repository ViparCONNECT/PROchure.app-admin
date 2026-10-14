import type { FormFieldDefinition } from '@/api/types';

export const ADMIN_CREATE_FIELDS: FormFieldDefinition[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    required: false,
    maxLength: 100,
    create: true,
    edit: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: false,
    maxLength: 100,
    create: true,
    edit: true,
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    maxLength: 254,
    create: true,
    edit: false, // email cannot be changed after creation per API spec
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    minLength: 8,
    maxLength: 128,
    helpText: 'Minimum 8 characters',
    create: true,
    edit: false,
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: [
      { label: 'Admin', value: 'ADMIN' },
      { label: 'Super Admin', value: 'SUPER_ADMIN' },
    ],
    create: true,
    edit: true,
  },
];

export const ADMIN_EDIT_FIELDS: FormFieldDefinition[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    required: false,
    maxLength: 100,
    create: true,
    edit: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: false,
    maxLength: 100,
    create: true,
    edit: true,
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: false,
    options: [
      { label: 'Admin', value: 'ADMIN' },
      { label: 'Super Admin', value: 'SUPER_ADMIN' },
    ],
    create: true,
    edit: true,
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'boolean',
    create: false,
    edit: true,
    helpText: 'Deactivated admins cannot log in',
  },
];

export const CATEGORY_EDIT_FIELDS: FormFieldDefinition[] = [
  {
    name: 'name',
    label: 'Display Name',
    type: 'text',
    required: false,
    maxLength: 100,
    create: true,
    edit: true,
  },
  {
    name: 'isSubCategoryNeeded',
    label: 'Requires Sub-Category',
    type: 'boolean',
    create: true,
    edit: true,
    helpText: 'When enabled, profiles in this category must have a sub-category',
  },
];

export const SUBCATEGORY_FIELDS: FormFieldDefinition[] = [
  {
    name: 'name',
    label: 'Sub-Category Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 100,
    create: true,
    edit: true,
  },
];
