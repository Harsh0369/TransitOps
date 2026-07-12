import { prisma } from '../lib/prisma';
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { AuditService } from './audit.service';
import { QueryOptions } from '../utils/query.util';

export class TripService {
  async getAll(options?: QueryOptions) {
    const where = { deletedAt: null };
    
    if (options && options.exportData) {
      return prisma.trip.findMany({ 
        where, 
        include: { driver: { include: { user: true } }, vehicle: true }, 
        orderBy: { [options.sortBy]: options.sortOrder } 
      });
    }

    const [data, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: { driver: { include: { user: true } }, vehicle: true },
        skip: options ? options.skip : 0,
        take: options ? options.limit : 100,
        orderBy: options ? { [options.sortBy]: options.sortOrder } : { createdAt: 'desc' }
      }),
      prisma.trip.count({ where })
    ]);
    
    return { data, total };
  }

  async getTripsForDriver(userId: string) {
    const driver = await prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new Error('No driver profile found for this user');

    return prisma.trip.findMany({
      where: { driverId: driver.id, deletedAt: null },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTrip(data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const reasons: Record<string, string> = {};
      let isValid = true;

      // 1. Validation checks
      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) {
        reasons['Vehicle'] = 'Not found';
        isValid = false;
      } else {
        if (vehicle.status === 'RETIRED' || vehicle.status === 'IN_SHOP') {
           reasons['Vehicle Status'] = `Unavailable (${vehicle.status})`;
           isValid = false;
        } else {
           reasons['Vehicle Status'] = 'Available';
        }
        if (data.cargoWeight > vehicle.capacity) {
           reasons['Capacity'] = `Cargo weight (${data.cargoWeight}) exceeds capacity (${vehicle.capacity})`;
           isValid = false;
        } else {
           reasons['Capacity'] = 'Valid';
        }
      }

      const driver = await tx.driver.findUnique({ where: { id: data.driverId } });
      if (!driver) {
        reasons['Driver'] = 'Not found';
        isValid = false;
      } else {
        if (driver.status === 'SUSPENDED') {
           reasons['Driver Status'] = 'Suspended';
           isValid = false;
        } else {
           reasons['Driver Status'] = 'Active';
        }
        if (new Date(driver.licenseExpiry) < new Date()) {
           reasons['License'] = 'Expired';
           isValid = false;
        } else {
           reasons['License'] = 'Valid';
        }
      }

      if (!isValid) {
        const error = new Error('Trip creation blocked due to validation failures.');
        (error as any).reasons = reasons;
        throw error;
      }

      // 2. Create the trip in DRAFT
      const trip = await tx.trip.create({
        data: {
          ...data,
          userId, // The fleet manager who created it
          status: 'DRAFT',
        }
      });

      // 3. Log history
      await tx.tripStatusHistory.create({
        data: { tripId: trip.id, status: 'DRAFT', changedBy: userId }
      });

      AuditService.log('TRIP_CREATED', 'Trip', trip.id, userId, { source: data.source, destination: data.destination });

      return trip;
    });
  }

  async dispatchTrip(tripId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { vehicle: { include: { compliances: true } }, driver: true } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'DRAFT') throw new Error('Only DRAFT trips can be dispatched');

      // Compliance validation check
      const reasons: Record<string, string> = {};
      let isValid = true;
      const now = Date.now();
      const requiredTypes = ['INSURANCE', 'PUC', 'FITNESS', 'REGISTRATION'];
      for (const type of requiredTypes) {
        const comp = trip.vehicle.compliances.find((c: any) => c.type === type);
        if (!comp) {
          reasons[`Compliance: ${type}`] = 'Missing';
          isValid = false;
        } else if (now > new Date(comp.expiryDate).getTime()) {
          reasons[`Compliance: ${type}`] = 'Expired';
          isValid = false;
        } else {
          reasons[`Compliance: ${type}`] = 'Valid';
        }
      }

      if (trip.vehicle.status === 'IN_SHOP') {
        reasons['Vehicle Status'] = 'IN_SHOP';
        isValid = false;
      } else if (trip.vehicle.status === 'RETIRED') {
        reasons['Vehicle Status'] = 'RETIRED';
        isValid = false;
      } else if (trip.vehicle.status === 'ON_TRIP') {
        reasons['Vehicle Status'] = 'ON_TRIP';
        isValid = false;
      } else {
        reasons['Vehicle Status'] = 'Valid';
      }

      if (trip.driver.status === 'ON_TRIP') {
        reasons['Driver Status'] = 'ON_TRIP';
        isValid = false;
      } else if (trip.driver.status === 'SUSPENDED') {
        reasons['Driver Status'] = 'SUSPENDED';
        isValid = false;
      } else {
        reasons['Driver Status'] = 'Valid';
      }

      if (!isValid) {
        const err = new Error('Dispatch Blocked');
        (err as any).reasons = reasons;
        throw err;
      }

      // 1. Update trip status
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: 'DISPATCHED', dispatchDate: new Date() }
      });

      // 2. Lock assets
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } });

      // 3. Log history
      await tx.tripStatusHistory.create({ data: { tripId, status: 'DISPATCHED', previousStatus: 'DRAFT', changedBy: userId } });
      
      AuditService.log('TRIP_DISPATCHED', 'Trip', tripId, userId, { driverId: trip.driverId, vehicleId: trip.vehicleId });

      // Create Vehicle history
      await tx.vehicleStatusHistory.create({
        data: { vehicleId: trip.vehicleId, oldStatus: trip.vehicle.status, newStatus: 'ON_TRIP', changedBy: userId, remarks: 'Trip Dispatched' }
      });

      return updatedTrip;
    });
  }

  async reportTripComplete(tripId: string, finalOdometer: number, fuelUsed: number, userId: string, completionNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { driver: true } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'DISPATCHED' && trip.status !== 'PENDING_APPROVAL') {
        throw new Error('Only DISPATCHED or rejected PENDING_APPROVAL trips can be completed');
      }

      // Only the assigned driver can complete it (unless admin/manager overrides, but let's enforce driver for now)
      // Actually, we should check if the user is a Fleet Manager OR the assigned driver.
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user?.role === 'DRIVER' && trip.driver.userId !== userId) {
        throw new Error('You can only report completion for your own trips');
      }

      // Update trip to PENDING_APPROVAL
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { 
          status: 'PENDING_APPROVAL',
          finalOdometer,
          fuelUsed,
          completionNotes,
          completionDate: new Date(),
          // Clear rejection notes if they exist
          rejectionReason: null,
          rejectedBy: null,
          rejectedAt: null
        }
      });

      await tx.tripStatusHistory.create({ data: { tripId, status: 'PENDING_APPROVAL', previousStatus: trip.status, changedBy: userId } });
      AuditService.log('TRIP_PENDING_APPROVAL', 'Trip', tripId, userId, { finalOdometer, fuelUsed, completionNotes });
      return updatedTrip;
    });
  }

  async approveTrip(tripId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { vehicle: true } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'PENDING_APPROVAL') throw new Error('Trip must be PENDING_APPROVAL to be approved');

      if (!trip.finalOdometer || !trip.fuelUsed) throw new Error('Missing odometer or fuel data');

      // Odometer validation
      if (trip.finalOdometer <= trip.vehicle.odometer) {
        throw new Error(`Submitted final odometer (${trip.finalOdometer}) must be greater than current vehicle odometer (${trip.vehicle.odometer})`);
      }

      if (trip.distance) {
        const diff = trip.finalOdometer - trip.vehicle.odometer;
        const maxExpected = trip.distance * 1.10; // 10% tolerance
        const minExpected = trip.distance * 0.90;
        if (diff > maxExpected || diff < minExpected) {
          throw new Error(`Odometer difference (${diff}) deviates too much from expected distance (${trip.distance}). Tolerance is 10%.`);
        }
      }

      // Fuel validation
      if (trip.fuelUsed <= 0) {
        throw new Error('Fuel used must be strictly greater than 0');
      }

      // Update trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: 'COMPLETED' }
      });

      // Free assets
      const oldVehicleStatus = trip.vehicle.status;
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { 
          status: 'AVAILABLE',
          odometer: trip.finalOdometer
        }
      });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });

      await tx.vehicleStatusHistory.create({
        data: { vehicleId: trip.vehicleId, oldStatus: oldVehicleStatus, newStatus: 'AVAILABLE', changedBy: userId, remarks: 'Trip Approved' }
      });

      // Optional: Generate Fuel Log automatically
      if (trip.fuelUsed) {
        // We will calculate a mock fuel cost if none provided, or $1.5/liter default
        const cost = trip.fuelUsed * 1.5;
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            liters: trip.fuelUsed,
            cost: cost
          }
        });
      }

      await tx.tripStatusHistory.create({ data: { tripId, status: 'COMPLETED', previousStatus: 'PENDING_APPROVAL', changedBy: userId } });
      AuditService.log('TRIP_APPROVED', 'Trip', tripId, userId, { fuelCost: trip.fuelUsed ? trip.fuelUsed * 1.5 : 0 });
      return updatedTrip;
    });
  }

  async rejectTrip(tripId: string, reason: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'PENDING_APPROVAL') throw new Error('Only PENDING_APPROVAL trips can be rejected');

      // Keep assets ON_TRIP, but update Trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          rejectionReason: reason,
          rejectedBy: userId,
          rejectedAt: new Date()
          // Note: status remains PENDING_APPROVAL so the driver can resubmit over it
        }
      });

      await tx.tripStatusHistory.create({ data: { tripId, status: 'PENDING_APPROVAL', previousStatus: 'PENDING_APPROVAL', changedBy: userId, remarks: `Rejected: ${reason}` } });
      AuditService.log('TRIP_REJECTED', 'Trip', tripId, userId, { reason });
      return updatedTrip;
    });
  }

  async cancelTrip(tripId: string, userId: string, role: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status === 'COMPLETED') throw new Error('Cannot cancel a completed trip');

      // Rule: Pending Approval trips cannot be cancelled unless explicitly rejected by Fleet Manager
      if (trip.status === 'PENDING_APPROVAL' && role !== 'FLEET_MANAGER' && role !== 'ADMIN') {
        throw new Error('Only Fleet Managers can reject/cancel a trip pending approval');
      }

      // If it was dispatched or pending, free the assets
      if (trip.status === 'DISPATCHED' || trip.status === 'PENDING_APPROVAL') {
        const v = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
        if (v) {
          await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
          await tx.vehicleStatusHistory.create({
            data: { vehicleId: trip.vehicleId, oldStatus: v.status, newStatus: 'AVAILABLE', changedBy: userId, remarks: 'Trip Cancelled' }
          });
        }
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
      }

      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: 'CANCELLED' }
      });
      
      await tx.tripStatusHistory.create({ data: { tripId, status: 'CANCELLED', previousStatus: trip.status, changedBy: userId } });
      AuditService.log('TRIP_CANCELLED', 'Trip', tripId, userId, { previousStatus: trip.status });
      return updatedTrip;
    });
  }
}
