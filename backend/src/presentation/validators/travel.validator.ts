import { z } from 'zod';

export const createTravelSchema = z.object({
  origin: z.string().min(2, 'El origen es requerido').max(200),
  destination: z.string().min(2, 'El destino es requerido').max(200),
  departureTime: z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'Fecha de salida inválida',
    }),
  availableSeats: z
    .number()
    .int()
    .min(1, 'Debe haber al menos un asiento')
    .max(10, 'Máximo 10 asientos'),
  pricePerSeat: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(1000, 'El precio es demasiado alto'),
  vehicleId: z.string().min(1, 'El vehículo es requerido'),
});

export const requestTravelSchema = z.object({
  travelId: z.string().min(1, 'El viaje es requerido'),
});

export const travelFiltersSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minSeats: z.coerce.number().int().min(1).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export const updateTravelStatusSchema = z.object({
  status: z.enum(['active', 'in_progress', 'completed', 'cancelled']),
});

export const travelIdParamSchema = z.object({
  id: z.string().min(1),
});
