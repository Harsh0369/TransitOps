import { z } from 'zod';

// Validate every input using Zod
export const sampleSchema = z.object({
  name: z.string().min(1, "Name is required"),
});