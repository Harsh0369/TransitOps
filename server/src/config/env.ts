import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8000'),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);