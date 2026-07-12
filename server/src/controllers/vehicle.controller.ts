import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { QueryUtil } from '../utils/query.util';
import { CsvUtil } from '../utils/csv.util';

const vehicleService = new VehicleService();

export class VehicleController {
  
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const options = QueryUtil.parse(req, 'createdAt');
      const filters = {
        ...options,
        roadworthy: req.query.roadworthy === 'true' ? true : req.query.roadworthy === 'false' ? false : undefined,
        complianceStatus: req.query.complianceStatus ? JSON.parse(req.query.complianceStatus as string) : undefined
      };
      
      const result = await vehicleService.getAllVehicles(filters);
      
      if (options.exportData) {
        res.header('Content-Type', 'text/csv');
        res.attachment('vehicles.csv');
        return res.send(CsvUtil.jsonToCsv(result as any[]));
      }
      
      const { data, total } = result as { data: any[], total: number };
      res.status(200).json(successResponse('Vehicles retrieved successfully', data, QueryUtil.getPaginationMeta(total, options)));
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await vehicleService.getComplianceDashboard();
      res.status(200).json(successResponse('Compliance dashboard retrieved', dashboard));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id as string);
      res.status(200).json(successResponse('Vehicle retrieved successfully', vehicle));
    } catch (error: any) {
      if (error.message === 'Vehicle not found') {
        res.status(404).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json(successResponse('Vehicle created successfully', vehicle));
    } catch (error: any) {
      if (error.message === 'Registration number already exists') {
        res.status(400).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.updateVehicle(req.params.id as string, req.body);
      res.status(200).json(successResponse('Vehicle updated successfully', vehicle));
    } catch (error) {
      next(error);
    }
  }

  static async retire(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.retireVehicle(req.params.id as string);
      res.status(200).json(successResponse('Vehicle retired successfully', vehicle));
    } catch (error) {
      next(error);
    }
  }
}
