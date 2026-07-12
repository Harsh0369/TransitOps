import { z } from 'zod';

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Name is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.string().min(1, 'Type is required'),
  capacity: z.number().positive('Capacity must be positive'),
  odometer: z.number().min(0, 'Odometer cannot be negative').optional(),
  acquisitionCost: z.number().positive('Acquisition cost must be positive'),
});

export const updateVehicleSchema = createVehicleSchema.partial();
