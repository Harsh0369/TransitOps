import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createExpenseSchema, createFuelLogSchema } from '../validators/finance.validator';

const router = Router();

router.use(authenticate);

// Reports (Strict access)
router.get('/reports/operational-cost', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), FinanceController.getOperationalCostChart);
router.get('/reports/fuel-efficiency', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), FinanceController.getFuelEfficiency);
router.get('/reports/vehicle-roi/:vehicleId', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), FinanceController.getVehicleROI);

// Fuel Logs
router.get('/fuel', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), FinanceController.getAllFuelLogs);
router.post('/fuel', authorize(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), validate(createFuelLogSchema), FinanceController.createFuelLog);

// Expenses
router.get('/expenses', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), FinanceController.getAllExpenses);
router.post('/expenses', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), validate(createExpenseSchema), FinanceController.createExpense);

export default router;
