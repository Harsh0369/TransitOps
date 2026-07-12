import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  tripId: z.string().uuid('Invalid trip ID').optional().nullable(),
  liters: z.number().positive('Liters must be strictly positive'),
  cost: z.number().positive('Cost must be strictly positive'),
  date: z.string().transform(val => new Date(val)).optional(),
});

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  expenseType: z.string().min(2, 'Expense type is required'),
  amount: z.number().positive('Amount must be strictly positive'),
  description: z.string().min(2, 'Description is required'),
  date: z.string().transform(val => new Date(val)).optional(),
});
