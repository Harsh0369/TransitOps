import { prisma } from '../lib/prisma';
import { VehicleStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class VehicleService {
  async getAllVehicles() {
    return prisma.vehicle.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  }

  async createVehicle(data: any) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber }
    });
    
    if (existing) {
      throw new Error('Registration number already exists');
    }
    
    const newVehicle = await prisma.vehicle.create({
      data,
    });
    AuditService.log('VEHICLE_CREATED', 'Vehicle', newVehicle.id, undefined, { registrationNumber: newVehicle.registrationNumber });
    return newVehicle;
  }

  async updateVehicle(id: string, data: any, userId: string = 'SYSTEM') {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.status === 'RETIRED') throw new Error('Cannot edit a RETIRED vehicle');

    const updated = await prisma.vehicle.update({
      where: { id },
      data,
    });
    AuditService.log('VEHICLE_UPDATED', 'Vehicle', id, userId, { updatedFields: Object.keys(data) });
    return updated;
  }

  async retireVehicle(id: string, userId: string = 'SYSTEM') {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new Error('Vehicle not found');

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { status: 'RETIRED' }
    });
    await prisma.vehicleStatusHistory.create({
      data: { vehicleId: id, oldStatus: vehicle.status, newStatus: 'RETIRED', changedBy: userId, remarks: 'Vehicle Retired' }
    });
    return updated;
  }

  async updateStatus(id: string, status: VehicleStatus, userId: string = 'SYSTEM') {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new Error('Vehicle not found');
    
    if (vehicle.status === 'RETIRED') {
      throw new Error('Cannot change status of a RETIRED vehicle');
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });
    await prisma.vehicleStatusHistory.create({
      data: { vehicleId: id, oldStatus: vehicle.status, newStatus: status, changedBy: userId, remarks: 'Manual Override' }
    });
    AuditService.log('VEHICLE_STATUS_CHANGED', 'Vehicle', id, userId, { status });
    return updated;
  }
}
