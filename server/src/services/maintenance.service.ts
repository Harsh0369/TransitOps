import { prisma } from '../lib/prisma';
import { AuditService } from './audit.service';
import { QueryOptions } from '../utils/query.util';

export class MaintenanceService {
  async getAll(options?: QueryOptions) {
    const where = { deletedAt: null };
    
    if (options && options.exportData) {
      return prisma.maintenance.findMany({ where, include: { vehicle: true }, orderBy: { [options.sortBy]: options.sortOrder } });
    }

    const [data, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        include: { vehicle: true },
        skip: options ? options.skip : 0,
        take: options ? options.limit : 100,
        orderBy: options ? { [options.sortBy]: options.sortOrder } : { createdAt: 'desc' }
      }),
      prisma.maintenance.count({ where })
    ]);
    
    return { data, total };
  }

  async startMaintenance(data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw new Error('Vehicle not found');
      
      if (vehicle.status === 'IN_SHOP' || vehicle.status === 'RETIRED') {
        throw new Error(`Vehicle cannot go into maintenance because its status is ${vehicle.status}`);
      }

      // Check for active maintenance
      const activeMaint = await tx.maintenance.findFirst({
        where: { vehicleId: vehicle.id, status: 'OPEN' }
      });
      if (activeMaint) {
        throw new Error('Vehicle already has an active maintenance record');
      }

      const maintenance = await tx.maintenance.create({
        data: {
          ...data,
          status: 'OPEN',
          startDate: new Date()
        }
      });

      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: 'IN_SHOP' }
      });

      await tx.vehicleStatusHistory.create({
        data: { vehicleId: vehicle.id, oldStatus: vehicle.status, newStatus: 'IN_SHOP', changedBy: userId, remarks: 'Maintenance Started' }
      });

      AuditService.log('MAINTENANCE_STARTED', 'Maintenance', maintenance.id, userId, { vehicleId: vehicle.id });
      return maintenance;
    });
  }

  async closeMaintenance(id: string, cost: number, userId: string) {
    return prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.findUnique({ where: { id }, include: { vehicle: true } });
      if (!maintenance) throw new Error('Maintenance record not found');
      if (maintenance.status === 'CLOSED') throw new Error('Maintenance already closed');

      const updatedMaintenance = await tx.maintenance.update({
        where: { id },
        data: {
          status: 'CLOSED',
          cost,
          endDate: new Date()
        }
      });

      // If the vehicle was manually retired during maintenance, leave it retired
      if (maintenance.vehicle.status !== 'RETIRED') {
        await tx.vehicle.update({
          where: { id: maintenance.vehicleId },
          data: { status: 'AVAILABLE' }
        });

        await tx.vehicleStatusHistory.create({
          data: { vehicleId: maintenance.vehicleId, oldStatus: maintenance.vehicle.status, newStatus: 'AVAILABLE', changedBy: userId, remarks: 'Maintenance Closed' }
        });
      }

      AuditService.log('MAINTENANCE_CLOSED', 'Maintenance', id, userId, { cost });
      return updatedMaintenance;
    });
  }
}
