import { z } from 'zod';
import { Role, UserStatus } from '@prisma/client';

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});
