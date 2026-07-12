// Shared TypeScript types

export type Role = 'ADMIN' | 'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';

export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';

export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export type MaintenanceStatus = 'OPEN' | 'CLOSED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  model: string;
  type: string;
  capacity: number; // in kg
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  pollutionExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  driverId: string;
  driverName?: string;
  vehicleId: string;
  vehicleName?: string;
  cargoWeight: number; // in kg
  distance?: number;
  dispatchDate?: string;
  completionDate?: string;
  finalOdometer?: number;
  fuelUsed?: number;
  status: TripStatus;
  eta?: string;
  consignmentCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  maintenanceType: string;
  description: string;
  status: MaintenanceStatus;
  cost?: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  tripId?: string;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  expenseType: string;
  amount: number;
  description: string;
  date: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  reason?: string;
  ipAddress?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  timestamp: string;
}