import { Request, Response, NextFunction } from 'express';
import { ComplianceService } from '../services/compliance.service';
import { successResponse, errorResponse } from '../utils/response.util';

const complianceService = new ComplianceService();

export class ComplianceController {
  static async getCompliance(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await complianceService.getComplianceRecords(req.params.vehicleId as string);
      res.status(200).json(successResponse('Compliance records retrieved', records));
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await complianceService.createCompliance(req.params.vehicleId as string, req.body, req.user!.userId);
      res.status(201).json(successResponse('Compliance record created', record));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async renew(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await complianceService.renewCompliance(req.params.id as string, req.body, req.user!.userId);
      res.status(200).json(successResponse('Compliance record renewed', record));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await complianceService.deleteCompliance(req.params.id as string, req.user!.userId);
      res.status(200).json(successResponse('Compliance record deleted successfully'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }
}
