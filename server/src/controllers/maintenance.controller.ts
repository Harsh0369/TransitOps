import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenance.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { QueryUtil } from '../utils/query.util';
import { CsvUtil } from '../utils/csv.util';

const maintenanceService = new MaintenanceService();

export class MaintenanceController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const options = QueryUtil.parse(req, 'createdAt');
      const result = await maintenanceService.getAll(options);

      if (options.exportData) {
        res.header('Content-Type', 'text/csv');
        res.attachment('maintenance.csv');
        return res.send(CsvUtil.jsonToCsv(result as any[]));
      }

      const { data, total } = result as { data: any[], total: number };
      res.status(200).json(successResponse('Maintenance records retrieved', data, QueryUtil.getPaginationMeta(total, options)));
    } catch (error) {
      next(error);
    }
  }

  static async start(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await maintenanceService.startMaintenance(req.body, req.user!.userId);
      res.status(201).json(successResponse('Maintenance started', data));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async close(req: Request, res: Response, next: NextFunction) {
    try {
      const { cost } = req.body;
      const data = await maintenanceService.closeMaintenance(req.params.id as string, cost, req.user!.userId);
      res.status(200).json(successResponse('Maintenance closed', data));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }
}
