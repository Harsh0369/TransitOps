import { prisma } from '../lib/prisma';

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
    
    return prisma.vehicle.create({ data });
  }

  async updateVehicle(id: string, data: any) {
    return prisma.vehicle.update({
      where: { id },
      data
    });
  }

  async retireVehicle(id: string) {
    // Hard deletes are generally bad in ERPs, so we use status transitions
    return prisma.vehicle.update({
      where: { id },
      data: { status: 'RETIRED' }
    });
  }
}
