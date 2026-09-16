import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL es requerida')
    .default('postgresql://postgres:postgres@localhost:5432/clab_carpool?schema=public'),

  JWT_SECRET: z.string().min(10, 'JWT_SECRET debe tener al menos 10 caracteres'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(10, 'JWT_REFRESH_SECRET debe tener al menos 10 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  EMAIL_VERIFICATION_CODE_EXPIRES_IN: z.string().default('10m'),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('no-reply@clab.app'),

  APP_URL: z.string().default('http://localhost:3000'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_VERIFY_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_VERIFY_MAX: z.coerce.number().int().positive().default(3),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(12),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error('Error de configuración de variables de entorno:\n' + details);
  process.exit(1);
}

export const env = parsed.data;
