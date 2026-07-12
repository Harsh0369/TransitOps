import { prisma } from '../lib/prisma';
import { AuditService } from './audit.service';
import { QueryOptions } from '../utils/query.util';

export class ExpenseService {
  async getAll(options?: QueryOptions) {
    const where = { deletedAt: null };
    
    if (options && options.exportData) {
      return prisma.expense.findMany({ where, include: { vehicle: true }, orderBy: { [options.sortBy]: options.sortOrder } });
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { vehicle: true },
        skip: options ? options.skip : 0,
        take: options ? options.limit : 100,
        orderBy: options ? { [options.sortBy]: options.sortOrder } : { date: 'desc' }
      }),
      prisma.expense.count({ where })
    ]);
    
    return { data, total };
  }

  async createExpense(data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw new Error('Vehicle not found');

      const expense = await tx.expense.create({ data });
      AuditService.log('EXPENSE_CREATED', 'Expense', expense.id, userId, { amount: expense.amount, type: expense.expenseType });
      return expense;
    });
  }
}

export class FuelService {
  async getAll(options?: QueryOptions) {
    const where = { deletedAt: null };
    
    if (options && options.exportData) {
      return prisma.fuelLog.findMany({ where, include: { vehicle: true, trip: true }, orderBy: { [options.sortBy]: options.sortOrder } });
    }

    const [data, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        include: { vehicle: true, trip: true },
        skip: options ? options.skip : 0,
        take: options ? options.limit : 100,
        orderBy: options ? { [options.sortBy]: options.sortOrder } : { date: 'desc' }
      }),
      prisma.fuelLog.count({ where })
    ]);
    
    return { data, total };
  }

  async createFuelLog(data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw new Error('Vehicle not found');

      if (data.tripId) {
        const trip = await tx.trip.findUnique({ where: { id: data.tripId } });
        if (!trip) throw new Error('Trip not found');
        if (trip.vehicleId !== data.vehicleId) throw new Error('Trip does not belong to the specified vehicle');
        
        const existingLog = await tx.fuelLog.findUnique({ where: { tripId: data.tripId } });
        if (existingLog) throw new Error('A fuel log has already been recorded for this trip');
      }

      const fuelLog = await tx.fuelLog.create({ data });
      AuditService.log('FUEL_LOG_CREATED', 'FuelLog', fuelLog.id, userId, { liters: fuelLog.liters, cost: fuelLog.cost, tripId: fuelLog.tripId });
      
      // Update the fuelUsed on the Trip if applicable
      if (data.tripId) {
        await tx.trip.update({
          where: { id: data.tripId },
          data: { fuelUsed: fuelLog.liters }
        });
      }

      return fuelLog;
    });
  }
}

export class FinancialReportService {
  // 1. Operational Cost Chart
  async getOperationalCostChart(startDate: Date, endDate: Date) {
    const expenses = await prisma.expense.findMany({
      where: { deletedAt: null, date: { gte: startDate, lte: endDate } }
    });
    
    const fuelLogs = await prisma.fuelLog.findMany({
      where: { deletedAt: null, date: { gte: startDate, lte: endDate } }
    });

    const maintenance = await prisma.maintenance.findMany({
      where: { deletedAt: null, cost: { not: null }, endDate: { gte: startDate, lte: endDate } }
    });

    // Grouping by month (YYYY-MM)
    const monthlyCosts: Record<string, { fuel: number, maintenance: number, other: number }> = {};
    
    const addToMonth = (date: Date, type: 'fuel' | 'maintenance' | 'other', amount: number) => {
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyCosts[monthStr]) monthlyCosts[monthStr] = { fuel: 0, maintenance: 0, other: 0 };
      monthlyCosts[monthStr][type] += amount;
    };

    fuelLogs.forEach(f => addToMonth(f.date, 'fuel', f.cost));
    expenses.forEach(e => addToMonth(e.date, 'other', e.amount));
    maintenance.forEach(m => { if (m.endDate && m.cost) addToMonth(m.endDate, 'maintenance', m.cost) });

    return monthlyCosts;
  }

  // 2. Fuel Efficiency (Km / Liter and Cost / Km)
  async getFuelEfficiency(vehicleId?: string) {
    const whereClause: any = { deletedAt: null, tripId: { not: null } };
    if (vehicleId) whereClause.vehicleId = vehicleId;

    const fuelLogsWithTrips = await prisma.fuelLog.findMany({
      where: whereClause,
      include: { trip: true, vehicle: true }
    });

    let totalLiters = 0;
    let totalCost = 0;
    let totalDistance = 0;

    const vehicleStats: Record<string, { distance: number, liters: number, cost: number }> = {};

    fuelLogsWithTrips.forEach(f => {
      if (f.trip && f.trip.distance) {
        totalLiters += f.liters;
        totalCost += f.cost;
        totalDistance += f.trip.distance;

        const reg = f.vehicle.registrationNumber;
        if (!vehicleStats[reg]) vehicleStats[reg] = { distance: 0, liters: 0, cost: 0 };
        vehicleStats[reg].distance += f.trip.distance;
        vehicleStats[reg].liters += f.liters;
        vehicleStats[reg].cost += f.cost;
      }
    });

    return {
      fleetAverage: {
        kmPerLiter: totalLiters > 0 ? Number((totalDistance / totalLiters).toFixed(2)) : 0,
        costPerKm: totalDistance > 0 ? Number((totalCost / totalDistance).toFixed(2)) : 0
      },
      byVehicle: vehicleStats
    };
  }

  // 3. Vehicle ROI (Acquisition Cost vs Total Operational Costs)
  async getVehicleROI(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new Error('Vehicle not found');

    const expenses = await prisma.expense.aggregate({
      where: { vehicleId, deletedAt: null },
      _sum: { amount: true }
    });

    const fuel = await prisma.fuelLog.aggregate({
      where: { vehicleId, deletedAt: null },
      _sum: { cost: true }
    });

    const maintenance = await prisma.maintenance.aggregate({
      where: { vehicleId, deletedAt: null },
      _sum: { cost: true }
    });

    const totalOperationalCost = 
      (expenses._sum.amount || 0) + 
      (fuel._sum.cost || 0) + 
      (maintenance._sum.cost || 0);

    return {
      registrationNumber: vehicle.registrationNumber,
      acquisitionCost: vehicle.acquisitionCost,
      totalOperationalCost,
      netValue: vehicle.acquisitionCost - totalOperationalCost // Proxy for ROI structure
    };
  }
}
