import { z } from 'zod';

export const registerVehicleSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida').max(60),
  model: z.string().min(1, 'El modelo es requerido').max(60),
  plate: z
    .string()
    .regex(/^[A-Za-z]{3}-?\d{3,4}$/, 'Placa inválida. Formato: ABC-123'),
  color: z.string().min(1, 'El color es requerido').max(30),
  seats: z.number().int().min(1).max(10),
});

export const updateVehicleSchema = registerVehicleSchema.partial();

export const vehicleIdParamSchema = z.object({
  id: z.string().min(1),
});
