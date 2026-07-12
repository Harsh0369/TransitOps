import { Request, Response, NextFunction } from 'express';
import { DriverService } from '../services/driver.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { QueryUtil } from '../utils/query.util';
import { CsvUtil } from '../utils/csv.util';

const driverService = new DriverService();

export class DriverController {
  
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const options = QueryUtil.parse(req, 'createdAt');
      const result = await driverService.getAll(options);

      if (options.exportData) {
        res.header('Content-Type', 'text/csv');
        res.attachment('drivers.csv');
        return res.send(CsvUtil.jsonToCsv(result as any[]));
      }

      const { data, total } = result as { data: any[], total: number };
      res.status(200).json(successResponse('Drivers retrieved successfully', data, QueryUtil.getPaginationMeta(total, options)));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.getDriverById(req.params.id as string);
      res.status(200).json(successResponse('Driver retrieved successfully', driver));
    } catch (error: any) {
      if (error.message === 'Driver not found') {
        res.status(404).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      
      // If the user is self-onboarding as a driver, force the profile to link to their own account
      if (req.user?.role === 'DRIVER') {
        payload.userId = req.user.userId;
      }

      const driver = await driverService.createDriver(payload);
      res.status(201).json(successResponse('Driver created successfully', driver));
    } catch (error: any) {
      if (error.message === 'License number already exists') {
        res.status(400).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.updateDriver(req.params.id as string, req.body);
      res.status(200).json(successResponse('Driver updated successfully', driver));
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const driver = await driverService.updateStatus(req.params.id as string, status, req.user!.userId);
      res.status(200).json(successResponse('Driver status updated successfully', driver));
    } catch (error) {
      next(error);
    }
  }

  static async updateSafetyScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { safetyScore } = req.body;
      const driver = await driverService.updateSafetyScore(req.params.id as string, safetyScore, req.user!.userId);
      res.status(200).json(successResponse('Driver safety score updated', driver));
    } catch (error) {
      next(error);
    }
  }

  static async renewLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const { licenseExpiry } = req.body;
      const driver = await driverService.renewLicense(req.params.id as string, new Date(licenseExpiry), req.user!.userId);
      res.status(200).json(successResponse('Driver license renewed', driver));
    } catch (error) {
      next(error);
    }
  }
}
