import { z } from 'zod';

export const rateTripSchema = z.object({
  travelId: z.string().min(1, 'El viaje es requerido'),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const userIdParamSchema = z.object({
  userId: z.string().min(1),
});
