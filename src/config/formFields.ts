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

export const LANGUAGES_OPTIONS = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese',
  'Maithili', 'Sanskrit', 'Nepali', 'Konkani', 'Sindhi',
].map((l) => ({ label: l, value: l }));

const WORKING_HOURS_PLACEHOLDER = 'e.g. 09:00 AM to 01:00 PM | Lunch Break | 02:00 PM to 07:00 PM';

export const PROFILE_FIELDS: FormFieldDefinition[] = [
  {
    name: 'categoryId',
    label: 'Category',
    type: 'select',
    required: true,
    source: 'categories',
    create: true,
    edit: true,
  },
  {
    name: 'subCategoryId',
    label: 'Sub-Category',
    type: 'select',
    source: 'subcategories',
    create: true,
    edit: true,
    helpText: 'Required when the selected category uses sub-categories',
  },
  {
    name: 'name',
    label: 'Business Name',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    create: true,
    edit: true,
  },
  {
    name: 'yearOfEstablishment',
    label: 'Year of Establishment',
    type: 'text',
    required: false,
    maxLength: 4,
    create: true,
    edit: true,
  },
  {
    name: 'image',
    label: 'Profile Image',
    type: 'imageUpload',
    required: false,
    uploadFolder: 'profiles',
    create: true,
    edit: true,
  },
  {
    name: 'logo',
    label: 'Logo',
    type: 'imageUpload',
    required: false,
    uploadFolder: 'profiles',
    create: true,
    edit: true,
  },

  // ─── Address section ─────────────────────────────────────────────────────────
  {
    name: 'address',
    label: 'Address',
    type: 'section',
    fields: [
      { name: 'address.buildingMallPropertyName', label: 'Building / Mall / Property Name', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'address.doorShopNo', label: 'Door / Shop No.', type: 'text', maxLength: 50, create: true, edit: true },
      { name: 'address.floor', label: 'Floor', type: 'text', maxLength: 50, create: true, edit: true },
      { name: 'address.streetLaneRoadNameSubLocality', label: 'Street / Lane / Road / Sub-Locality', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'address.nearestLandmark', label: 'Nearest Landmark', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'address.secondaryPrimaryLocality', label: 'Secondary / Primary Locality', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'address.cityTown', label: 'City / Town', type: 'text', required: true, maxLength: 100, create: true, edit: true },
      { name: 'address.stateProvince', label: 'State / Province', type: 'text', required: true, maxLength: 100, create: true, edit: true },
      { name: 'address.country', label: 'Country', type: 'text', required: true, maxLength: 100, create: true, edit: true },
      { name: 'address.pinCodeZipCode', label: 'PIN / ZIP Code', type: 'text', required: true, maxLength: 20, create: true, edit: true },
    ],
  },

  // ─── Contact section ─────────────────────────────────────────────────────────
  {
    name: 'contact',
    label: 'Contact',
    type: 'section',
    fields: [
      { name: 'contact.countryCode', label: 'Country Code', type: 'text', maxLength: 10, create: true, edit: true, helpText: 'e.g. +91' },
      { name: 'contact.officialContactNumber', label: 'Official Contact Number', type: 'text', required: true, maxLength: 20, create: true, edit: true },
      { name: 'contact.officialEmailId', label: 'Official Email', type: 'email', required: true, maxLength: 254, create: true, edit: true },
      { name: 'contact.officialWebsiteApp', label: 'Website / App URL', type: 'text', create: true, edit: true, helpText: 'https://...' },
      { name: 'contact.contactPersonName', label: 'Contact Person Name', type: 'text', maxLength: 100, create: true, edit: true },
      { name: 'contact.contactPersonDesignation', label: 'Contact Person Designation', type: 'text', maxLength: 100, create: true, edit: true },
      {
        name: 'contact.mostComfortablePreferredLanguages',
        label: 'Preferred Languages',
        type: 'multiSelect',
        options: LANGUAGES_OPTIONS,
        create: true,
        edit: true,
      },
    ],
  },

  // ─── Working hours section (replaced by WorkingHoursSection component) ────────
  {
    name: 'workingHours',
    label: 'Working Hours',
    type: 'section',
    fields: [
      { name: 'workingHours.monday', label: 'Monday', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'workingHours.tuesday', label: 'Tuesday', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'workingHours.wednesday', label: 'Wednesday', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'workingHours.thursday', label: 'Thursday', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'workingHours.friday', label: 'Friday', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'workingHours.saturday', label: 'Saturday', type: 'text', maxLength: 200, create: true, edit: true },
      { name: 'workingHours.sunday', label: 'Sunday', type: 'text', maxLength: 200, create: true, edit: true },
    ],
  },
];
