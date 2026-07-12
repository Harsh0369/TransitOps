import { prisma } from '../lib/prisma';
import { VehicleStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class VehicleService {
  async getAllVehicles() {
    return prisma.vehicle.findMany({
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

  async updateVehicle(id: string, data: any) {
    const updated = await prisma.vehicle.update({
      where: { id },
      data,
    });
    AuditService.log('VEHICLE_UPDATED', 'Vehicle', id, undefined, { updatedFields: Object.keys(data) });
    return updated;
  }

  async retireVehicle(id: string) {
    // Hard deletes are generally bad in ERPs, so we use status transitions
    return prisma.vehicle.update({
      where: { id },
      data: { status: 'RETIRED' }
    });
  }

  async updateStatus(id: string, status: VehicleStatus) {
    const updated = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });
    AuditService.log('VEHICLE_STATUS_CHANGED', 'Vehicle', id, undefined, { status });
    return updated;
  }
}
