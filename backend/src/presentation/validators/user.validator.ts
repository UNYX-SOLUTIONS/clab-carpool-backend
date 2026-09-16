import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(120).optional(),
  phone: z.string().min(8).max(15).optional(),
  photoUrl: z.string().url('URL de foto inválida').optional(),
});
