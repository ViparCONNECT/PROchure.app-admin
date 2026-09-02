import { z } from 'zod';

const optionalUrl = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''));

const addressSchema = z.object({
  buildingMallPropertyName: z.string().max(200).optional().or(z.literal('')),
  doorShopNo: z.string().max(50).optional().or(z.literal('')),
  floor: z.string().max(50).optional().or(z.literal('')),
  streetLaneRoadNameSubLocality: z.string().max(200).optional().or(z.literal('')),
  nearestLandmark: z.string().max(200).optional().or(z.literal('')),
  secondaryPrimaryLocality: z.string().max(200).optional().or(z.literal('')),
  cityTown: z.string().min(1, 'City/Town is required').max(100),
  stateProvince: z.string().min(1, 'State/Province is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  pinCodeZipCode: z.string().max(20).optional().or(z.literal('')),
});

const contactSchema = z.object({
  countryCode: z.string().max(10).optional().or(z.literal('')),
  officialContactNumber: z.string().max(20).optional().or(z.literal('')),
  officialEmailId: z.string().email('Enter a valid email').max(254).optional().or(z.literal('')),
  officialWebsiteApp: optionalUrl,
  contactPersonName: z.string().max(100).optional().or(z.literal('')),
  contactPersonDesignation: z.string().max(100).optional().or(z.literal('')),
  mostComfortablePreferredLanguages: z.array(z.string()).optional(),
});

const workingHoursSchema = z.object({
  monday: z.string().max(200).optional().or(z.literal('')),
  tuesday: z.string().max(200).optional().or(z.literal('')),
  wednesday: z.string().max(200).optional().or(z.literal('')),
  thursday: z.string().max(200).optional().or(z.literal('')),
  friday: z.string().max(200).optional().or(z.literal('')),
  saturday: z.string().max(200).optional().or(z.literal('')),
  sunday: z.string().max(200).optional().or(z.literal('')),
});

export const profileSchema = z.object({
  isDisabled: z.boolean().default(false).optional(),
  isWomenEntrepreneur: z.boolean().default(false).optional(),
  image: z.string().min(1, 'Profile Image is required'),
  logo: optionalUrl,
  categoryId: z.string().min(1, 'Category is required'),
  subCategoryId: z.string().optional().or(z.literal('')),
  name: z.string().min(1, 'Name is required').max(200),
  professionalTitle: z.string().max(20).optional().or(z.literal('')),
  qualifications: z.string().max(200).optional().or(z.literal('')),
  yearOfEstablishment: z.string().max(4).optional().or(z.literal('')),
  specializations: z.string().max(500).optional().or(z.literal('')),
  services: z.string().max(1000).optional().or(z.literal('')),
  address: addressSchema,
  contact: contactSchema.optional(),
  workingHours: workingHoursSchema.optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
