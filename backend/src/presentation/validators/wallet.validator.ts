import { z } from 'zod';

export const rechargeSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a cero').max(5000),
  paymentMethod: z
    .string()
    .min(1, 'El método de pago es requerido')
    .max(50),
});
