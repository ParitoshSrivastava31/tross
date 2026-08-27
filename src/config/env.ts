import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const envSchema = z.object({
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

export type Env = z.infer<typeof envSchema>;

let parsedData: Env;
try {
  parsedData = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  parsedData = envSchema.parse({});
}

export const env: Env = parsedData;
