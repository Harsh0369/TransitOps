import { Vehicle, Driver, Trip, Maintenance, Expense, FuelLog } from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'V-101',
    registrationNumber: 'GJ-01-XX-9001',
    name: 'VAN-05',
    model: 'Tata Winger',
    type: 'Van',
    capacity: 1000,
    odometer: 45200,
    acquisitionCost: 12000,
    status: 'ON_TRIP',
    region: 'West',
    insuranceExpiry: '2027-02-15',
    fitnessExpiry: '2026-12-01',
    pollutionExpiry: '2026-09-10',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'V-102',
    registrationNumber: 'GJ-01-XX-9002',
    name: 'TTR-12',
    model: 'BharatBenz 5528T',
    type: 'Tractor-Trailer',
    capacity: 15000,
    odometer: 112000,
    acquisitionCost: 45000,
    status: 'AVAILABLE',
    region: 'North',
    insuranceExpiry: '2027-05-20',
    fitnessExpiry: '2027-03-15',
    pollutionExpiry: '2026-06-30', // EXPIRED (pollution)
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'V-103',
    registrationNumber: 'GJ-01-XX-9003',
    name: 'MCV-01',
    model: 'Mahindra Furio 14',
    type: 'Medium Cargo Vehicle',
    capacity: 5000,
    odometer: 78500,
    acquisitionCost: 22000,
    status: 'ON_TRIP',
    region: 'East',
    insuranceExpiry: '2026-12-30',
    fitnessExpiry: '2027-02-05',
    pollutionExpiry: '2026-11-20',
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'V-104',
    registrationNumber: 'GJ-01-XX-9004',
    name: 'TRK-08',
    model: 'Ashok Leyland Ecomet',
    type: 'Heavy Truck',
    capacity: 10000,
    odometer: 94100,
    acquisitionCost: 28000,
    status: 'IN_SHOP',
    region: 'South',
    insuranceExpiry: '2027-01-10',
    fitnessExpiry: '2026-10-15',
    pollutionExpiry: '2026-08-05',
    createdAt: '2024-08-05T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'V-105',
    registrationNumber: 'GJ-01-XX-9005',
    name: 'VAN-02',
    model: 'Mahindra Supro',
    type: 'Van',
    capacity: 1200,
    odometer: 32400,
    acquisitionCost: 8500,
    status: 'AVAILABLE',
    region: 'West',
    insuranceExpiry: '2026-06-15', // EXPIRED (insurance)
    fitnessExpiry: '2027-01-10',
    pollutionExpiry: '2026-10-18',
    createdAt: '2025-03-22T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'V-106',
    registrationNumber: 'GJ-01-XX-9006',
    name: 'TRK-03',
    model: 'Eicher Pro 2049',
    type: 'Heavy Truck',
    capacity: 8000,
    odometer: 145000,
    acquisitionCost: 24000,
    status: 'RETIRED',
    region: 'East',
    insuranceExpiry: '2025-12-01',
    fitnessExpiry: '2025-08-15',
    pollutionExpiry: '2025-09-01',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'V-107',
    registrationNumber: 'GJ-01-XX-9007',
    name: 'VAN-09',
    model: 'Force Traveler',
    type: 'Van',
    capacity: 2000,
    odometer: 56000,
    acquisitionCost: 15000,
    status: 'AVAILABLE',
    region: 'South',
    insuranceExpiry: '2027-08-01',
    fitnessExpiry: '2026-07-25', // EXPIRING SOON
    pollutionExpiry: '2027-02-01',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'V-108',
    registrationNumber: 'GJ-01-XX-9008',
    name: 'MINI-04',
    model: 'Tata Ace Gold',
    type: 'Mini-Truck',
    capacity: 750,
    odometer: 28000,
    acquisitionCost: 5500,
    status: 'AVAILABLE',
    region: 'West',
    insuranceExpiry: '2026-11-12',
    fitnessExpiry: '2027-04-18',
    pollutionExpiry: '2026-12-30',
    createdAt: '2025-06-10T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'D-201',
    name: 'Alex',
    licenseNumber: 'DL-20250001',
    licenseCategory: 'LMV',
    licenseExpiry: '2030-05-15',
    contactNumber: '+91 98765 43210',
    safetyScore: 95.5,
    performance: {
      onTimeDeliveries: 18,
      lateDeliveries: 2,
      violations: 0,
      breakdowns: 1
    },
    status: 'ON_TRIP',
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'D-202',
    name: 'Sam',
    licenseNumber: 'DL-20240008',
    licenseCategory: 'HMV',
    licenseExpiry: '2029-08-20',
    contactNumber: '+91 98765 43211',
    safetyScore: 98.2,
    performance: {
      onTimeDeliveries: 24,
      lateDeliveries: 1,
      violations: 0,
      breakdowns: 0
    },
    status: 'AVAILABLE',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'D-203',
    name: 'Priya',
    licenseNumber: 'DL-20240015',
    licenseCategory: 'HMV',
    licenseExpiry: '2028-11-30',
    contactNumber: '+91 98765 43212',
    safetyScore: 92.0,
    performance: {
      onTimeDeliveries: 20,
      lateDeliveries: 1,
      violations: 1,
      breakdowns: 0
    },
    status: 'ON_TRIP',
    createdAt: '2024-11-22T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'D-204',
    name: 'Raj',
    licenseNumber: 'DL-20250042',
    licenseCategory: 'HMV',
    licenseExpiry: '2031-01-10',
    contactNumber: '+91 98765 43213',
    safetyScore: 88.7,
    performance: {
      onTimeDeliveries: 15,
      lateDeliveries: 3,
      violations: 2,
      breakdowns: 1
    },
    status: 'AVAILABLE',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'D-205',
    name: 'Amit',
    licenseNumber: 'DL-20240099',
    licenseCategory: 'LMV',
    licenseExpiry: '2029-04-18',
    contactNumber: '+91 98765 43214',
    safetyScore: 90.0,
    performance: {
      onTimeDeliveries: 12,
      lateDeliveries: 4,
      violations: 1,
      breakdowns: 2
    },
    status: 'OFF_DUTY',
    createdAt: '2024-04-20T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'D-206',
    name: 'Rahul',
    licenseNumber: 'DL-20230012',
    licenseCategory: 'HMV',
    licenseExpiry: '2027-02-14',
    contactNumber: '+91 98765 43215',
    safetyScore: 65.4,
    performance: {
      onTimeDeliveries: 8,
      lateDeliveries: 7,
      violations: 4,
      breakdowns: 3
    },
    status: 'SUSPENDED',
    createdAt: '2023-02-15T10:00:00Z',
    updatedAt: '2026-07-12T08:00:00Z'
  }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'T9001',
    source: 'Anandnagar Depot',
    destination: 'Ahmedabad Hub',
    driverId: 'D-201',
    driverName: 'Alex',
    vehicleId: 'V-101',
    vehicleName: 'VAN-05',
    cargoWeight: 800,
    distance: 45,
    dispatchDate: '2026-07-12T08:15:00Z',
    status: 'DISPATCHED',
    eta: '45 min',
    consignmentCode: 'C-901',
    createdAt: '2026-07-12T08:00:00Z',
    updatedAt: '2026-07-12T08:15:00Z'
  },
  {
    id: 'T9002',
    source: 'Vatva Industrial Area',
    destination: 'Sanand Warehouse',
    driverId: 'D-202',
    driverName: 'Sam',
    vehicleId: 'V-102',
    vehicleName: 'TTR-12',
    cargoWeight: 12000,
    distance: 35,
    dispatchDate: '2026-07-11T14:30:00Z',
    completionDate: '2026-07-11T16:00:00Z',
    finalOdometer: 112035,
    fuelUsed: 14,
    status: 'COMPLETED',
    eta: '-',
    consignmentCode: 'C-902',
    createdAt: '2026-07-11T14:00:00Z',
    updatedAt: '2026-07-11T16:00:00Z'
  },
  {
    id: 'T9003',
    source: 'Moraiya',
    destination: 'Kalol Depot',
    driverId: 'D-203',
    driverName: 'Priya',
    vehicleId: 'V-103',
    vehicleName: 'MCV-01',
    cargoWeight: 4200,
    distance: 65,
    dispatchDate: '2026-07-12T07:45:00Z',
    status: 'DISPATCHED',
    eta: '1h 10m',
    consignmentCode: 'C-903',
    createdAt: '2026-07-12T07:30:00Z',
    updatedAt: '2026-07-12T07:45:00Z'
  },
  {
    id: 'T9004',
    source: 'Naroda Depot',
    destination: 'Aslali Warehouse',
    driverId: '',
    driverName: '',
    vehicleId: '',
    vehicleName: '',
    cargoWeight: 600,
    status: 'DRAFT',
    eta: 'Awaiting vehicle',
    consignmentCode: 'C-904',
    createdAt: '2026-07-12T09:00:00Z',
    updatedAt: '2026-07-12T09:00:00Z'
  },
  {
    id: 'T9006',
    source: 'Moraiya',
    destination: 'Kalol Depot',
    driverId: 'D-204',
    driverName: 'Raj',
    vehicleId: 'V-104',
    vehicleName: 'TRK-08',
    cargoWeight: 7500,
    status: 'CANCELLED',
    eta: 'Vehicle went to maintenance',
    consignmentCode: 'C-906',
    createdAt: '2026-07-12T06:00:00Z',
    updatedAt: '2026-07-12T06:45:00Z'
  }
];

export const INITIAL_MAINTENANCE: Maintenance[] = [
  {
    id: 'M-501',
    vehicleId: 'V-104',
    vehicleName: 'TRK-08',
    maintenanceType: 'Engine Tuning',
    description: 'Fuel injector replacement and engine tuning due to rough idling.',
    status: 'OPEN',
    startDate: '2026-07-12T06:30:00Z',
    createdAt: '2026-07-12T06:30:00Z',
    updatedAt: '2026-07-12T06:30:00Z'
  },
  {
    id: 'M-502',
    vehicleId: 'V-106',
    vehicleName: 'TRK-03',
    maintenanceType: 'Suspension Overhaul',
    description: 'Replaced rear leaf springs and shock absorbers.',
    status: 'CLOSED',
    cost: 1250,
    startDate: '2026-06-10T09:00:00Z',
    endDate: '2026-06-12T17:00:00Z',
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-12T17:00:00Z'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'E-601',
    vehicleId: 'V-101',
    vehicleName: 'VAN-05',
    expenseType: 'Toll Fees',
    amount: 120,
    description: 'National Highway NH-48 toll fees',
    date: '2026-07-12T08:30:00Z'
  },
  {
    id: 'E-602',
    vehicleId: 'V-102',
    vehicleName: 'TTR-12',
    expenseType: 'Insurance Premium',
    amount: 2400,
    description: 'Annual comprehensive insurance premium renewal',
    date: '2026-07-05T10:00:00Z'
  },
  {
    id: 'E-603',
    vehicleId: 'V-104',
    vehicleName: 'TRK-08',
    expenseType: 'Maintenance Parts',
    amount: 350,
    description: 'Replacement filters and seal rings',
    date: '2026-07-12T07:00:00Z'
  }
];

export const INITIAL_FUEL_LOGS: FuelLog[] = [
  {
    id: 'FL-701',
    vehicleId: 'V-101',
    vehicleName: 'VAN-05',
    tripId: 'T9001',
    liters: 25,
    cost: 2500, // INR
    date: '2026-07-12T08:20:00Z'
  },
  {
    id: 'FL-702',
    vehicleId: 'V-102',
    vehicleName: 'TTR-12',
    tripId: 'T9002',
    liters: 120,
    cost: 12000,
    date: '2026-07-11T14:45:00Z'
  }
];
