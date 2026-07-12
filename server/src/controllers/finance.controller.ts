import { Request, Response, NextFunction } from 'express';
import { ExpenseService, FuelService, FinancialReportService } from '../services/finance.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { QueryUtil } from '../utils/query.util';
import { CsvUtil } from '../utils/csv.util';

const expenseService = new ExpenseService();
const fuelService = new FuelService();
const reportService = new FinancialReportService();

export class FinanceController {
  static async getAllExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const options = QueryUtil.parse(req, 'date');
      const result = await expenseService.getAll(options);

      if (options.exportData) {
        res.header('Content-Type', 'text/csv');
        res.attachment('expenses.csv');
        return res.send(CsvUtil.jsonToCsv(result as any[]));
      }

      const { data, total } = result as { data: any[], total: number };
      res.status(200).json(successResponse('Expenses retrieved', data, QueryUtil.getPaginationMeta(total, options)));
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
      const options = QueryUtil.parse(req, 'date');
      const result = await fuelService.getAll(options);

      if (options.exportData) {
        res.header('Content-Type', 'text/csv');
        res.attachment('fuel_logs.csv');
        return res.send(CsvUtil.jsonToCsv(result as any[]));
      }

      const { data, total } = result as { data: any[], total: number };
      res.status(200).json(successResponse('Fuel logs retrieved', data, QueryUtil.getPaginationMeta(total, options)));
    } catch (error) {
      next(error);
    }
  }

  static async createFuelLog(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await fuelService.createFuelLog(req.body, req.user!.userId);
      res.status(201).json(successResponse('Fuel log recorded', data));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async getOperationalCostChart(req: Request, res: Response, next: NextFunction) {
    try {
      // Default to last 12 months if dates are not provided
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      
      const data = await reportService.getOperationalCostChart(startDate, endDate);
      res.status(200).json(successResponse('Operational cost chart retrieved', data));
    } catch (error) {
      next(error);
    }
  }

  static async getFuelEfficiency(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.query.vehicleId as string | undefined;
      const data = await reportService.getFuelEfficiency(vehicleId);
      res.status(200).json(successResponse('Fuel efficiency retrieved', data));
    } catch (error) {
      next(error);
    }
  }

  static async getVehicleROI(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getVehicleROI(req.params.vehicleId as string);
      res.status(200).json(successResponse('Vehicle ROI retrieved', data));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }
}
