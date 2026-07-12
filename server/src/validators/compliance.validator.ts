import { z } from 'zod';
import { ComplianceType } from '@prisma/client';

export const createComplianceSchema = z.object({
  type: z.nativeEnum(ComplianceType),
  certificateNumber: z.string().min(1, 'Certificate number is required'),
  issueDate: z.string().transform((val) => new Date(val)),
  expiryDate: z.string().transform((val) => new Date(val)),
  remarks: z.string().optional(),
}).refine(data => data.expiryDate > data.issueDate, {
  message: 'Expiry date must be after issue date',
  path: ['expiryDate']
});

export const renewComplianceSchema = z.object({
  certificateNumber: z.string().min(1, 'Certificate number is required').optional(),
  issueDate: z.string().transform((val) => new Date(val)),
  expiryDate: z.string().transform((val) => new Date(val)),
  remarks: z.string().optional(),
}).refine(data => data.expiryDate > data.issueDate, {
  message: 'Expiry date must be after issue date',
  path: ['expiryDate']
});
