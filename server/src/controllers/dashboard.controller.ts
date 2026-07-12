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

  static async getOperationsCenter(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOperationsCenter();
      res.status(200).json(successResponse('Operations center retrieved successfully', data));
    } catch (error) {
      next(error);
    }
  }

  static async getExecutiveInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getExecutiveInsights();
      res.status(200).json(successResponse('Insights retrieved successfully', data));
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const data = await dashboardService.globalSearch(query);
      res.status(200).json(successResponse('Search results retrieved successfully', data));
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      // Inline import to avoid circular dependencies if any, or just import at top.
      const { NotificationService } = require('../services/notification.service');
      const data = await NotificationService.getDynamicNotifications();
      res.status(200).json(successResponse('Notifications retrieved successfully', data));
    } catch (error) {
      next(error);
    }
  }
}
