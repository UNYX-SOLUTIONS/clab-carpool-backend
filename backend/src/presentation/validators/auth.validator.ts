import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
  .regex(
    /[^A-Za-z0-9]/,
    'La contraseña debe contener al menos un carácter especial',
  );

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  email: z.string().email('Correo institucional inválido'),
  password: passwordSchema,
  fullName: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(120, 'El nombre es demasiado largo'),
  institutionId: z.string().min(1, 'La institución es requerida'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  code: z.string().min(6, 'El código de verificación es inválido'),
});

export const resendCodeSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es requerido'),
});
