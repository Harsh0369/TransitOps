import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid Vehicle ID'),
  maintenanceType: z.string().min(1, 'Maintenance type is required'),
  description: z.string().min(1, 'Description is required'),
});

export const closeMaintenanceSchema = z.object({
  cost: z.number().positive('Cost must be positive'),
});
