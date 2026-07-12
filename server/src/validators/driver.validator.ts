import { z } from 'zod';
import { DriverStatus } from '@prisma/client';

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiry: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  contactNumber: z.string().min(1, 'Contact number is required'),
  userEmail: z.string().email('Invalid email').optional(),
  userPhoneNumber: z.string().optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

export const updateDriverStatusSchema = z.object({
  status: z.nativeEnum(DriverStatus),
});

export const updateSafetyScoreSchema = z.object({
  safetyScore: z.number().min(0).max(100, 'Score must be between 0 and 100'),
});

export const renewLicenseSchema = z.object({
  licenseExpiry: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
