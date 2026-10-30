import { z } from 'zod';

const CATEGORY_TYPES = ['PROFESSIONAL_CONSULTANT', 'SERVICE_AND_RETAIL_BRANDS'] as const;

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(CATEGORY_TYPES, { required_error: 'Type is required' }),
  groupId: z.string({ required_error: 'Category type is required' }).min(1, 'Category type is required'),
  isSubCategoryNeeded: z.boolean().default(false),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  groupId: z.string().min(1, 'Category type is required').optional(),
  isSubCategoryNeeded: z.boolean().optional(),
});

export const createSubCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Sub-category name is required')
    .max(100, 'Name must be at most 100 characters'),
});

export const updateSubCategorySchema = createSubCategorySchema;

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;
export type CreateSubCategoryFormValues = z.infer<typeof createSubCategorySchema>;
