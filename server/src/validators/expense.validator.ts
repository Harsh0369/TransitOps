import { z } from 'zod';

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid Vehicle ID'),
  expenseType: z.string().min(1, 'Expense type is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
});
