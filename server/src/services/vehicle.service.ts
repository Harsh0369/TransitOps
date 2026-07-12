import { prisma } from '../lib/prisma';
import { VehicleStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class VehicleService {
  private computeComplianceStatus(compliance: any, now: number) {
    if (!compliance) return 'MISSING';
    const expiry = new Date(compliance.expiryDate).getTime();
    if (now > expiry) return 'EXPIRED';
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (expiry - now <= thirtyDaysMs) return 'EXPIRING_SOON';
    return 'VALID';
  }

  private mapVehicleWithCompliance(vehicle: any) {
    const now = Date.now();
    const complianceMap: Record<string, any> = {};
    let allValid = true;
    let missingRequired = 0;

    const requiredTypes = ['INSURANCE', 'PUC', 'FITNESS', 'REGISTRATION'];

    for (const type of requiredTypes) {
      const comp = vehicle.compliances?.find((c: any) => c.type === type);
      const status = this.computeComplianceStatus(comp, now);
      
      complianceMap[type] = comp ? {
        ...comp,
        status
      } : { status };

      if (status === 'EXPIRED' || status === 'MISSING') {
        allValid = false;
        if (status === 'MISSING') missingRequired++;
      }
    }

    const isRoadworthy = 
      vehicle.status !== 'RETIRED' && 
      vehicle.status !== 'IN_SHOP' && 
      allValid && 
      missingRequired === 0;

    return {
      ...vehicle,
      roadworthyStatus: isRoadworthy ? 'ROAD_FIT' : 'ROAD_UNFIT',
      compliances: complianceMap
    };
  }

  async getAllVehicles(filters?: { roadworthy?: boolean, complianceStatus?: Record<string, string> }) {
    const where: any = { deletedAt: null };

    if (filters?.roadworthy !== undefined) {
      const now = new Date();
      if (filters.roadworthy) {
        // Needs to not be RETIRED or IN_SHOP, and all 4 compliances must have expiryDate > now
        where.status = { notIn: ['RETIRED', 'IN_SHOP'] };
        where.AND = ['INSURANCE', 'PUC', 'FITNESS', 'REGISTRATION'].map(type => ({
          compliances: { some: { type, expiryDate: { gt: now } } }
        }));
      } else {
        // Unfit: either RETIRED, IN_SHOP, or missing/expired any of the 4
        where.OR = [
          { status: { in: ['RETIRED', 'IN_SHOP'] } },
          { compliances: { none: { type: 'INSURANCE' } } },
          { compliances: { none: { type: 'PUC' } } },
          { compliances: { none: { type: 'FITNESS' } } },
          { compliances: { none: { type: 'REGISTRATION' } } },
          { compliances: { some: { expiryDate: { lte: now } } } }
        ];
      }
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { compliances: true },
      orderBy: { createdAt: 'desc' }
    });

    // We can also do application-level filtering for specific compliance statuses (EXPIRING_SOON) 
    // since the logic is complex for Prisma
    let mapped = vehicles.map(v => this.mapVehicleWithCompliance(v));

    if (filters?.complianceStatus) {
      mapped = mapped.filter(v => {
        for (const [type, reqStatus] of Object.entries(filters.complianceStatus!)) {
          if (v.compliances[type]?.status !== reqStatus) return false;
        }
        return true;
      });
    }

    return mapped;
  }

  async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { id },
      include: { compliances: true }
    });
    if (!vehicle) throw new Error('Vehicle not found');
    return this.mapVehicleWithCompliance(vehicle);
  }

  async getComplianceDashboard() {
    const vehicles = await this.getAllVehicles();
    
    let expiredInsurance = 0;
    let expiredFitness = 0;
    let expiredPuc = 0;
    let expiredRegistration = 0;
    let roadworthy = 0;
    let roadUnfit = 0;
    let expiringSoon = 0;

    const alerts: string[] = [];

    for (const v of vehicles) {
      if (v.roadworthyStatus === 'ROAD_FIT') roadworthy++;
      else roadUnfit++;

      const types = ['INSURANCE', 'FITNESS', 'PUC', 'REGISTRATION'];
      for (const t of types) {
        const status = v.compliances[t]?.status;
        if (status === 'EXPIRED') {
          if (t === 'INSURANCE') expiredInsurance++;
          if (t === 'FITNESS') expiredFitness++;
          if (t === 'PUC') expiredPuc++;
          if (t === 'REGISTRATION') expiredRegistration++;
          
          alerts.push(`Vehicle ${v.registrationNumber} ${t} expired.`);
        } else if (status === 'EXPIRING_SOON') {
          expiringSoon++;
          const expiryDate = new Date(v.compliances[t].expiryDate);
          const diffDays = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          alerts.push(`Vehicle ${v.registrationNumber} ${t} expires in ${diffDays} days.`);
        }
      }
    }

    return {
      kpis: {
        expiredInsurance,
        expiredFitness,
        expiredPuc,
        expiredRegistration,
        roadworthy,
        roadUnfit,
        expiringSoon
      },
      alerts
    };
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
