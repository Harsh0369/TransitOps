import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createExpenseSchema } from '../validators/expense.validator';

const router = Router();

router.use(authenticate);

// Expense Routes
router.get('/expenses', authorize(['FINANCIAL_ANALYST', 'FLEET_MANAGER', 'ADMIN']), FinanceController.getAllExpenses);
router.post('/expenses', authorize(['FINANCIAL_ANALYST', 'ADMIN']), validate(createExpenseSchema), FinanceController.createExpense);

// Fuel Routes
router.get('/fuel', authorize(['FINANCIAL_ANALYST', 'FLEET_MANAGER', 'ADMIN']), FinanceController.getAllFuelLogs);

export default router;
