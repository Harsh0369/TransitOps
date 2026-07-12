import { prisma } from '../lib/prisma';
import { ComplianceType } from '@prisma/client';
import { AuditService } from './audit.service';

export class ComplianceService {
  async getComplianceRecords(vehicleId: string) {
    return prisma.vehicleCompliance.findMany({
      where: { vehicleId },
      orderBy: { expiryDate: 'asc' }
    });
  }

  async createCompliance(vehicleId: string, data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) throw new Error('Vehicle not found');
      if (vehicle.status === 'RETIRED') throw new Error('Cannot create compliance for a retired vehicle');

      const existing = await tx.vehicleCompliance.findUnique({
        where: { vehicleId_type: { vehicleId, type: data.type } }
      });

      if (existing) {
        throw new Error(`A compliance record of type ${data.type} already exists for this vehicle. Please renew it instead.`);
      }

      const compliance = await tx.vehicleCompliance.create({
        data: {
          ...data,
          vehicleId,
          createdBy: userId,
          updatedBy: userId
        }
      });

      AuditService.log('COMPLIANCE_CREATED', 'VehicleCompliance', compliance.id, userId, { type: data.type, vehicleId });
      return compliance;
    });
  }

  async renewCompliance(id: string, data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.vehicleCompliance.findUnique({ 
        where: { id },
        include: { vehicle: true }
      });
      if (!existing) throw new Error('Compliance record not found');
      if (existing.vehicle.status === 'RETIRED') throw new Error('Cannot renew compliance for a retired vehicle');

      if (new Date(data.expiryDate).getTime() === existing.expiryDate.getTime()) {
        throw new Error('Renewal rejected: Expiry date is unchanged');
      }

      const updated = await tx.vehicleCompliance.update({
        where: { id },
        data: {
          ...data,
          updatedBy: userId
        }
      });

      AuditService.log('COMPLIANCE_RENEWED', 'VehicleCompliance', id, userId, undefined, 
        { expiryDate: existing.expiryDate }, 
        { expiryDate: updated.expiryDate }
      );
      
      return updated;
    });
  }

  async deleteCompliance(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.vehicleCompliance.findUnique({ where: { id } });
      if (!existing) throw new Error('Compliance record not found');
      
      await tx.vehicleCompliance.delete({ where: { id } });
      
      AuditService.log('COMPLIANCE_DELETED', 'VehicleCompliance', id, userId, { type: existing.type, vehicleId: existing.vehicleId });
      return { success: true };
    });
  }
}
