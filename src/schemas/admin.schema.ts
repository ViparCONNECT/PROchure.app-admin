import { z } from 'zod';

export const createAdminSchema = z.object({
  firstName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN'], { required_error: 'Role is required' }),
});

export const editAdminSchema = z.object({
  firstName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().max(100).optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
export type EditAdminFormValues = z.infer<typeof editAdminSchema>;
