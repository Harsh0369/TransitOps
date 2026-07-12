import { z } from 'zod';

export const createTripSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  driverId: z.string().uuid('Invalid Driver ID'),
  vehicleId: z.string().uuid('Invalid Vehicle ID'),
  cargoWeight: z.number().positive('Cargo weight must be positive'),
  distance: z.number().positive('Distance must be positive').optional(),
});

export const completeTripSchema = z.object({
  finalOdometer: z.number().positive('Final odometer must be positive'),
  fuelUsed: z.number().positive('Fuel used must be positive'),
  completionNotes: z.string().optional(),
});
