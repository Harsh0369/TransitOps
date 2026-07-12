import { prisma } from '../lib/prisma';

export class DashboardService {
  async getFleetKpis() {
    // Vehicles
    const vehicles = await prisma.vehicle.findMany({ where: { deletedAt: null } });
    const totalVehicles = vehicles.length;
    let availableVehicles = 0;
    let activeVehicles = 0;
    let inShopVehicles = 0;
    let retiredVehicles = 0;

    for (const v of vehicles) {
      if (v.status === 'AVAILABLE') availableVehicles++;
      if (v.status === 'ON_TRIP') activeVehicles++;
      if (v.status === 'IN_SHOP') inShopVehicles++;
      if (v.status === 'RETIRED') retiredVehicles++;
    }

    // Drivers
    const drivers = await prisma.driver.findMany({ where: { deletedAt: null } });
    const totalDrivers = drivers.length;
    let driversOnDuty = 0;
    let availableDrivers = 0;

    for (const d of drivers) {
      if (d.status === 'ON_TRIP') driversOnDuty++;
      if (d.status === 'AVAILABLE') availableDrivers++;
    }

    // Trips
    const trips = await prisma.trip.findMany({ where: { deletedAt: null } });
    let activeTrips = 0;
    let pendingTrips = 0;

    for (const t of trips) {
      if (t.status === 'DISPATCHED') activeTrips++;
      if (t.status === 'PENDING_APPROVAL') pendingTrips++;
    }

    // Fleet Utilization
    // Utilization = (Active Vehicles / (Total Vehicles - Retired - In Shop)) * 100
    const usableFleet = totalVehicles - retiredVehicles - inShopVehicles;
    const fleetUtilizationPercentage = usableFleet > 0 
      ? Math.round((activeVehicles / usableFleet) * 100) 
      : 0;

    return {
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        active: activeVehicles,
        inShop: inShopVehicles,
        retired: retiredVehicles
      },
      drivers: {
        total: totalDrivers,
        onDuty: driversOnDuty,
        available: availableDrivers
      },
      trips: {
        active: activeTrips,
        pending: pendingTrips
      },
      fleetUtilizationPercentage
    };
  }

  async getOperationsCenter() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const tripsAwaitingApproval = await prisma.trip.findMany({
      where: { status: 'PENDING_APPROVAL', deletedAt: null },
      include: { driver: true, vehicle: true }
    });

    const vehiclesInShop = await prisma.vehicle.findMany({
      where: { status: 'IN_SHOP', deletedAt: null }
    });

    const compliances = await prisma.vehicleCompliance.findMany({
      where: { expiryDate: { lte: thirtyDaysFromNow } },
      include: { vehicle: true }
    });
    
    const expiredOrMissing = [];
    const expiringSoon = [];
    
    for (const c of compliances) {
      if (new Date(c.expiryDate) < now) {
         expiredOrMissing.push(c);
      } else {
         expiringSoon.push(c);
      }
    }

    const driverLicensesExpiringSoon = await prisma.driver.findMany({
      where: { licenseExpiry: { lte: thirtyDaysFromNow }, deletedAt: null }
    });

    const activeMaintenanceJobs = await prisma.maintenance.findMany({
      where: { status: 'OPEN', deletedAt: null },
      include: { vehicle: true }
    });

    const suspendedDrivers = await prisma.driver.findMany({
      where: { status: 'SUSPENDED', deletedAt: null }
    });

    return {
      tripsAwaitingApproval: { count: tripsAwaitingApproval.length, entities: tripsAwaitingApproval },
      vehiclesInShop: { count: vehiclesInShop.length, entities: vehiclesInShop },
      roadUnfitVehicles: { count: expiredOrMissing.length, entities: expiredOrMissing },
      compliancesExpiringSoon: { count: expiringSoon.length, entities: expiringSoon },
      driverLicensesExpiringSoon: { count: driverLicensesExpiringSoon.length, entities: driverLicensesExpiringSoon },
      activeMaintenanceJobs: { count: activeMaintenanceJobs.length, entities: activeMaintenanceJobs },
      suspendedDrivers: { count: suspendedDrivers.length, entities: suspendedDrivers }
    };
  }

  async getExecutiveInsights() {
    const kpis = await this.getFleetKpis();
    const ops = await this.getOperationsCenter();

    const expenses = await prisma.expense.groupBy({
      by: ['vehicleId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1
    });

    let highestCostVehicle = null;
    if (expenses.length > 0) {
      const v = await prisma.vehicle.findUnique({ where: { id: expenses[0].vehicleId } });
      highestCostVehicle = { vehicle: v, totalCost: expenses[0]._sum.amount };
    }

    const maintenance = await prisma.maintenance.aggregate({
      where: { status: 'CLOSED' },
      _sum: { cost: true }
    });

    return {
      fleetUtilization: `${kpis.fleetUtilizationPercentage}%`,
      vehiclesRequiringComplianceRenewal: ops.roadUnfitVehicles.count + ops.compliancesExpiringSoon.count,
      tripsAwaitingApproval: ops.tripsAwaitingApproval.count,
      highestOperationalCostVehicle: highestCostVehicle,
      totalMaintenanceCost: maintenance._sum.cost || 0
    };
  }

  async globalSearch(query: string) {
    if (!query) return { vehicles: [], drivers: [], trips: [], users: [] };
    
    const [vehicles, drivers, trips, users] = await Promise.all([
      prisma.vehicle.findMany({
        where: { OR: [{ registrationNumber: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }] },
        take: 10
      }),
      prisma.driver.findMany({
        where: { OR: [{ name: { contains: query, mode: 'insensitive' } }, { licenseNumber: { contains: query, mode: 'insensitive' } }] },
        take: 10
      }),
      prisma.trip.findMany({
        where: { OR: [{ source: { contains: query, mode: 'insensitive' } }, { destination: { contains: query, mode: 'insensitive' } }] },
        take: 10
      }),
      prisma.user.findMany({
        where: { OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }] },
        select: { id: true, name: true, email: true, role: true, status: true },
        take: 10
      })
    ]);

    return { vehicles, drivers, trips, users };
  }
}
