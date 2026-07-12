import { Request, Response, NextFunction } from 'express';
import { ExpenseService, FuelService } from '../services/finance.service';
import { successResponse, errorResponse } from '../utils/response.util';

const expenseService = new ExpenseService();
const fuelService = new FuelService();

export class FinanceController {
  static async getAllExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await expenseService.getAll();
      res.status(200).json(successResponse('Expenses retrieved', data));
    } catch (error) {
      next(error);
    }
  }

  static async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await expenseService.createExpense(req.body, req.user!.userId);
      res.status(201).json(successResponse('Expense logged', data));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async getAllFuelLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await fuelService.getAll();
      res.status(200).json(successResponse('Fuel logs retrieved', data));
    } catch (error) {
      next(error);
    }
  }
}
