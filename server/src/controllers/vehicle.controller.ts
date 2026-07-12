import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { successResponse, errorResponse } from '../utils/response.util';

const vehicleService = new VehicleService();

export class VehicleController {
  
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      res.status(200).json(successResponse('Vehicles retrieved successfully', vehicles));
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
