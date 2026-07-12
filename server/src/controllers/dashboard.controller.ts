import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/response.util';

const dashboardService = new DashboardService();

export class DashboardController {
  static async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await dashboardService.getFleetKpis();
      res.status(200).json(successResponse('Fleet KPIs retrieved successfully', kpis));
    } catch (error) {
      next(error);
    }
  }
}
