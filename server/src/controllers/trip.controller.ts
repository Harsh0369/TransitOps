import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service';
import { successResponse, errorResponse } from '../utils/response.util';

const tripService = new TripService();

export class TripController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await tripService.getAllTrips();
      res.status(200).json(successResponse('Trips retrieved successfully', trips));
    } catch (error) {
      next(error);
    }
  }

  static async getMyTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await tripService.getTripsForDriver(req.user!.userId);
      res.status(200).json(successResponse('Trips retrieved successfully', trips));
    } catch (error: any) {
      if (error.message === 'No driver profile found for this user') {
        res.status(404).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.createTrip(req.body, req.user!.userId);
      res.status(201).json(successResponse('Trip created successfully in DRAFT state', trip));
    } catch (error: any) {
      // Basic business logic error bubbling
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async dispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.dispatchTrip(req.params.id as string, req.user!.userId);
      res.status(200).json(successResponse('Trip dispatched successfully', trip));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async reportComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { finalOdometer, fuelUsed, completionNotes } = req.body;
      const trip = await tripService.reportTripComplete(
        req.params.id as string,
        finalOdometer,
        fuelUsed,
        req.user!.userId,
        completionNotes
      );
      res.status(200).json(successResponse('Trip reported complete. Pending manager approval.', trip));
    } catch (error: any) {
      if (error.message === 'You can only report completion for your own trips') {
        res.status(403).json(errorResponse(error.message));
        return;
      }
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.approveTrip(req.params.id as string, req.user!.userId);
      res.status(200).json(successResponse('Trip approved and assets freed', trip));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const trip = await tripService.rejectTrip(req.params.id as string, reason, req.user!.userId);
      res.status(200).json(successResponse('Trip completion rejected', trip));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.cancelTrip(
        req.params.id as string,
        req.user!.userId,
        req.user!.role
      );
      res.status(200).json(successResponse('Trip cancelled', trip));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.reportTripComplete(
        req.params.id as string,
        req.body.finalOdometer,
        req.body.fuelUsed,
        req.body.completionNotes,
        req.user!.userId
      );
      res.status(200).json(successResponse('Trip completed and awaiting approval', trip));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  }
}
