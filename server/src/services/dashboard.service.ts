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
}
