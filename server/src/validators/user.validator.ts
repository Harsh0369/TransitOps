import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});
