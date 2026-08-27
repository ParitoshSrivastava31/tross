import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LI_AT_COOKIE: z.string().optional(),
  JSESSIONID: z.string().optional(),
  PROXY_URL: z.string().optional(),
  ENABLE_SANDBOX_FALLBACK: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CORS_ORIGIN: z.string().default('*'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
