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

// placeholder removed (unused) to satisfy TypeScript

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
    label: 'Profile Type',
    type: 'select',
    source: 'subcategories',
    required: true,
    create: true,
    edit: true,
  },
  {
    name: 'professionalTitle',
    label: 'Title of Profession',
    type: 'select',
    required: false,
    options: [
      { label: 'Dr.', value: 'Dr.' },
      { label: 'Ar.', value: 'Ar.' },
      { label: 'Adv.', value: 'Adv.' },
      { label: 'CA', value: 'CA' },
    ],
    create: true,
    edit: true,
  },
  {
    name: 'name',
    label: 'Name (Consultant / Brand)',
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 200,
    create: true,
    edit: true,
  },
  {
    name: 'qualifications',
    label: 'Qualifications / Degrees',
    type: 'text',
    required: false,
    maxLength: 200,
    create: true,
    edit: true,
  },
  {
    name: 'yearOfEstablishment',
    label: 'Year of Establishment / Year of Starting Practice',
    type: 'text',
    required: false,
    maxLength: 4,
    create: true,
    edit: true,
  },
  {
    name: 'specializations',
    label: 'Specializations / Skills',
    type: 'text',
    required: false,
    maxLength: 500,
    create: true,
    edit: true,
  },
  {
    name: 'services',
    label: 'Services',
    type: 'text',
    required: false,
    maxLength: 1000,
    create: true,
    edit: true,
  },
  {
    name: 'image',
    label: 'Profile Image',
    type: 'imageUpload',
    required: true,
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
      { name: 'address.buildingMallPropertyName', label: 'Building / Mall / Property Name', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'address.doorShopNo', label: 'Door / Shop No.', type: 'text', required: false, maxLength: 50, create: true, edit: true },
      { name: 'address.floor', label: 'Floor', type: 'text', required: false, maxLength: 50, create: true, edit: true },
      { name: 'address.streetLaneRoadNameSubLocality', label: 'Street / Lane / Road / Sub-Locality', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'address.nearestLandmark', label: 'Nearest Landmark', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'address.secondaryPrimaryLocality', label: 'Secondary / Primary Locality', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'address.cityTown', label: 'City / Town', type: 'text', required: true, maxLength: 100, create: true, edit: true },
      { name: 'address.stateProvince', label: 'State / Province', type: 'text', required: true, maxLength: 100, create: true, edit: true },
      { name: 'address.country', label: 'Country', type: 'text', required: true, maxLength: 100, create: true, edit: true },
      { name: 'address.pinCodeZipCode', label: 'PIN / ZIP Code', type: 'text', required: false, maxLength: 20, create: true, edit: true },
    ],
  },

  // ─── Contact section ─────────────────────────────────────────────────────────
  {
    name: 'contact',
    label: 'Contact',
    type: 'section',
    fields: [
      { name: 'contact.countryCode', label: 'Country Code', type: 'text', required: false, maxLength: 10, create: true, edit: true, helpText: 'e.g. +91' },
      { name: 'contact.officialContactNumber', label: 'Official Contact Number', type: 'text', required: false, maxLength: 20, create: true, edit: true },
      { name: 'contact.officialEmailId', label: 'Official Email', type: 'email', required: false, maxLength: 254, create: true, edit: true },
      { name: 'contact.officialWebsiteApp', label: 'Website / App URL', type: 'text', required: false, create: true, edit: true, helpText: 'https://...' },
      { name: 'contact.contactPersonName', label: 'Contact Person Name', type: 'text', required: false, maxLength: 100, create: true, edit: true },
      { name: 'contact.contactPersonDesignation', label: 'Contact Person Designation', type: 'text', required: false, maxLength: 100, create: true, edit: true },
      {
        name: 'contact.mostComfortablePreferredLanguages',
        label: 'Preferred Languages',
        type: 'multiSelect',
        required: false,
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
      { name: 'workingHours.monday', label: 'Monday', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'workingHours.tuesday', label: 'Tuesday', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'workingHours.wednesday', label: 'Wednesday', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'workingHours.thursday', label: 'Thursday', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'workingHours.friday', label: 'Friday', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'workingHours.saturday', label: 'Saturday', type: 'text', required: false, maxLength: 200, create: true, edit: true },
      { name: 'workingHours.sunday', label: 'Sunday', type: 'text', required: false, maxLength: 200, create: true, edit: true },
    ],
  },
];
