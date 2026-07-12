'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, Driver, Trip, Maintenance, Expense, FuelLog, TripStatus, VehicleStatus, DriverStatus, AuditLog } from '../types';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  INITIAL_MAINTENANCE,
  INITIAL_EXPENSES,
  INITIAL_FUEL_LOGS,
  INITIAL_AUDIT_LOGS
} from '../constants/mockData';

interface Filters {
  vehicleType: string;
  status: string;
  region: string;
}

interface AppContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: Maintenance[];
  expenses: Expense[];
  fuelLogs: FuelLog[];
  auditLogs: AuditLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Vehicle CRUD
  createVehicle: (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  updateVehicle: (vehicleId: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Vehicle>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  // Driver CRUD
  createDriver: (driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Driver>;
  updateDriver: (driverId: string, driverData: Partial<Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Driver>;
  deleteDriver: (driverId: string) => Promise<void>;
  updateDriverSafetyScore: (driverId: string, newScore: number) => Promise<Driver>;
  suspendDriver: (driverId: string) => Promise<Driver>;
  // Trip
  createTripDraft: (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Trip>;
  cancelTrip: (tripId: string, reason: string) => Promise<Trip>;
  dispatchTrip: (tripId: string, driverId: string, vehicleId: string) => Promise<Trip>;
  completeTrip: (tripId: string, finalOdometer: number, fuelUsed: number) => Promise<Trip>;
  // Maintenance
  createMaintenance: (vehicleId: string, type: string, description: string) => Promise<Maintenance>;
  resolveMaintenance: (maintenanceId: string, cost: number) => Promise<Maintenance>;
  // Fuel
  addFuelLog: (fuelData: Omit<FuelLog, 'id'>) => Promise<FuelLog>;
  // Expense
  createExpense: (expenseData: Omit<Expense, 'id'>) => Promise<Expense>;
  updateExpense: (expenseId: string, expenseData: Partial<Omit<Expense, 'id'>>) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  resetAll: () => void;
  // Backward compatibility
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Trip;
  sendToMaintenance: (vehicleId: string, type: string, description: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [maintenance, setMaintenance] = useState<Maintenance[]>(INITIAL_MAINTENANCE);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    vehicleType: 'all',
    status: 'all',
    region: 'all'
  });

  const addAuditLog = (
    action: string,
    entity: string,
    entityId: string,
    oldValue?: any,
    newValue?: any,
    metadata?: any,
    reason?: string
  ) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      metadata,
      reason,
      ipAddress: '192.168.1.100',
      userId: 'u-101',
      user: {
        id: 'u-101',
        name: 'Manager A',
        email: 'manager.a@transitops.in',
        role: 'FLEET_MANAGER',
      },
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };


  // Automatically update statuses based on active trips
  useEffect(() => {
    // Keep vehicles and drivers synced with trip statuses
    setVehicles(prevVehicles => {
      return prevVehicles.map(veh => {
        // If retired or in shop, keep that
        if (veh.status === 'RETIRED' || veh.status === 'IN_SHOP') return veh;
        
        // Find if there is an active (DISPATCHED) trip for this vehicle
        const hasActiveTrip = trips.some(t => t.vehicleId === veh.id && t.status === 'DISPATCHED');
        const newStatus = hasActiveTrip ? 'ON_TRIP' : 'AVAILABLE';
        
        if (veh.status !== newStatus) {
          return { ...veh, status: newStatus };
        }
        return veh;
      });
    });

    setDrivers(prevDrivers => {
      return prevDrivers.map(drv => {
        if (drv.status === 'SUSPENDED' || drv.status === 'OFF_DUTY') return drv;
        
        const hasActiveTrip = trips.some(t => t.driverId === drv.id && t.status === 'DISPATCHED');
        const newStatus = hasActiveTrip ? 'ON_TRIP' : 'AVAILABLE';
        
        if (drv.status !== newStatus) {
          return { ...drv, status: newStatus };
        }
        return drv;
      });
    });
  }, [trips]);

  // Helper: Check if driver license is expired
  const isLicenseExpired = (driver: Driver): boolean => {
    return new Date(driver.licenseExpiry) < new Date();
  };

  // Vehicle Functions
  const createVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
    // Check unique registration number
    const existing = vehicles.find(v => v.registrationNumber === vehicleData.registrationNumber);
    if (existing) {
      throw new Error('Vehicle with this registration number already exists');
    }
    const nextIdNum = vehicles.length > 0 
      ? Math.max(...vehicles.map(v => parseInt(v.id.replace(/\D/g, '') || '0'))) + 1 
      : 101;
    const newId = `V-${nextIdNum}`;
    const nowStr = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      createdAt: nowStr,
      updatedAt: nowStr
    };
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  };

  const updateVehicle = async (vehicleId: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Vehicle> => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.status === 'RETIRED') throw new Error('Cannot edit retired vehicle');
    // Check unique registration number if updating
    if (vehicleData.registrationNumber && vehicleData.registrationNumber !== vehicle.registrationNumber) {
      const existing = vehicles.find(v => v.registrationNumber === vehicleData.registrationNumber);
      if (existing) throw new Error('Vehicle with this registration number already exists');
    }
    const nowStr = new Date().toISOString();
    const updatedVehicle = { ...vehicle, ...vehicleData, updatedAt: nowStr };
    setVehicles(prev => prev.map(v => v.id === vehicleId ? updatedVehicle : v));
    return updatedVehicle;
  };

  const deleteVehicle = async (vehicleId: string): Promise<void> => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };

  // Driver Functions
  const createDriver = async (driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> => {
    const nextIdNum = drivers.length > 0 
      ? Math.max(...drivers.map(d => parseInt(d.id.replace(/\D/g, '') || '0'))) + 1 
      : 201;
    const newId = `D-${nextIdNum}`;
    const nowStr = new Date().toISOString();
    const newDriver: Driver = {
      ...driverData,
      id: newId,
      createdAt: nowStr,
      updatedAt: nowStr
    };
    setDrivers(prev => [newDriver, ...prev]);
    return newDriver;
  };

  const updateDriver = async (driverId: string, driverData: Partial<Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Driver> => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) throw new Error('Driver not found');
    const nowStr = new Date().toISOString();
    const updatedDriver = { ...driver, ...driverData, updatedAt: nowStr };
    setDrivers(prev => prev.map(d => d.id === driverId ? updatedDriver : d));
    return updatedDriver;
  };

  const deleteDriver = async (driverId: string): Promise<void> => {
    setDrivers(prev => prev.filter(d => d.id !== driverId));
  };

  const updateDriverSafetyScore = async (driverId: string, newScore: number): Promise<Driver> => {
    return updateDriver(driverId, { safetyScore: newScore });
  };

  const suspendDriver = async (driverId: string): Promise<Driver> => {
    return updateDriver(driverId, { status: 'SUSPENDED' });
  };

  // Trip Functions
  const createTripDraft = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Trip> => {
    const nextIdNum = trips.length > 0 
      ? Math.max(...trips.map(t => parseInt(t.id.replace(/\D/g, '') || '0'))) + 1 
      : 9001;
    const newId = `T${nextIdNum}`;
    const nowStr = new Date().toISOString();
    const newTrip: Trip = {
      ...tripData,
      id: newId,
      status: 'DRAFT',
      createdAt: nowStr,
      updatedAt: nowStr
    };
    setTrips(prev => [newTrip, ...prev]);
    return newTrip;
  };

  const cancelTrip = async (tripId: string, reason: string): Promise<Trip> => {
    const nowStr = new Date().toISOString();
    let updatedTrip: Trip | undefined;
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        updatedTrip = {
          ...t,
          status: 'CANCELLED',
          eta: reason || 'Cancelled by operator',
          updatedAt: nowStr
        };
        return updatedTrip;
      }
      return t;
    }));
    if (!updatedTrip) throw new Error('Trip not found');
    return updatedTrip;
  };

  const dispatchTrip = async (tripId: string, driverId: string, vehicleId: string): Promise<Trip> => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'DRAFT') throw new Error('Only draft trips can be dispatched');
    
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) throw new Error('Driver not found');
    if (driver.status === 'SUSPENDED') throw new Error('Driver is suspended');
    if (driver.status !== 'AVAILABLE') throw new Error('Driver is not available');
    if (isLicenseExpired(driver)) throw new Error('Driver license is expired');
    
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.status === 'RETIRED') throw new Error('Vehicle is retired');
    if (vehicle.status === 'IN_SHOP') throw new Error('Vehicle is in maintenance');
    if (vehicle.status !== 'AVAILABLE') throw new Error('Vehicle is not available');
    if (trip.cargoWeight > vehicle.capacity) throw new Error('Cargo weight exceeds vehicle capacity');
    
    const nowStr = new Date().toISOString();
    let updatedTrip: Trip | undefined;
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        updatedTrip = {
          ...t,
          driverId,
          driverName: driver.name,
          vehicleId,
          vehicleName: vehicle.name,
          status: 'DISPATCHED',
          dispatchDate: nowStr,
          eta: 'En Route',
          updatedAt: nowStr
        };
        return updatedTrip;
      }
      return t;
    }));
    // Update vehicle and driver status
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'ON_TRIP' } : v));
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'ON_TRIP' } : d));
    
    if (!updatedTrip) throw new Error('Trip not found');
    return updatedTrip;
  };

  const completeTrip = async (tripId: string, finalOdometer: number, fuelUsed: number): Promise<Trip> => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'DISPATCHED') throw new Error('Only dispatched trips can be completed');
    
    const nowStr = new Date().toISOString();
    let updatedTrip: Trip | undefined;
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        updatedTrip = {
          ...t,
          status: 'COMPLETED',
          completionDate: nowStr,
          finalOdometer,
          fuelUsed,
          eta: '-',
          updatedAt: nowStr
        };
        return updatedTrip;
      }
      return t;
    }));

    // Update vehicle odometer
    if (trip.vehicleId) {
      setVehicles(prev => prev.map(v => {
        if (v.id === trip.vehicleId) {
          return {
            ...v,
            odometer: finalOdometer,
            status: 'AVAILABLE'
          };
        }
        return v;
      }));

      // Add fuel log if fuel used is provided
      if (fuelUsed > 0) {
        const nextFuelId = `FL-${fuelLogs.length + 701}`;
        const newFuelLog: FuelLog = {
          id: nextFuelId,
          vehicleId: trip.vehicleId,
          vehicleName: trip.vehicleName,
          tripId: tripId,
          liters: fuelUsed,
          cost: fuelUsed * 100, // estimated 100 INR/liter
          date: nowStr
        };
        setFuelLogs(prev => [newFuelLog, ...prev]);

        // Add expense log
        const nextExpId = `E-${expenses.length + 601}`;
        const newExpense: Expense = {
          id: nextExpId,
          vehicleId: trip.vehicleId,
          vehicleName: trip.vehicleName,
          expenseType: 'Fuel',
          amount: fuelUsed * 100,
          description: `Fuel purchase for Trip ${tripId}`,
          date: nowStr
        };
        setExpenses(prev => [newExpense, ...prev]);
      }
    }

    // Release driver
    if (trip.driverId) {
      setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, status: 'AVAILABLE' } : d));
    }

    addAuditLog(
      'TRIP_APPROVED',
      'Trip',
      tripId,
      { status: trip.status },
      { status: 'COMPLETED', finalOdometer, fuelUsed },
      { fuelCost: fuelUsed * 1.5 }
    );
    return updatedTrip as Trip;
  };

  // Maintenance Functions
  const createMaintenance = async (vehicleId: string, type: string, description: string): Promise<Maintenance> => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.status === 'RETIRED') throw new Error('Cannot maintain retired vehicle');
    if (vehicle.status !== 'AVAILABLE') throw new Error('Vehicle is not available');
    
    const nowStr = new Date().toISOString();
    const nextMaintId = `M-${maintenance.length + 501}`;
    const newMaint: Maintenance = {
      id: nextMaintId,
      vehicleId,
      vehicleName: vehicle.name,
      maintenanceType: type,
      description,
      status: 'OPEN',
      startDate: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr
    };
    setMaintenance(prev => [newMaint, ...prev]);
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'IN_SHOP' } : v));

    addAuditLog(
      'MAINTENANCE_STARTED',
      'Maintenance',
      nextMaintId,
      null,
      {
        vehicleId,
        maintenanceType: type,
        description,
        status: 'OPEN'
      },
      { vehicleId }
    );
    return newMaint;
  };

  const resolveMaintenance = async (maintenanceId: string, cost: number): Promise<Maintenance> => {
    const maint = maintenance.find(m => m.id === maintenanceId);
    if (!maint) throw new Error('Maintenance not found');
    const vehicle = vehicles.find(v => v.id === maint.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    const nowStr = new Date().toISOString();
    let updatedMaint: Maintenance | undefined;
    setMaintenance(prev => prev.map(m => {
      if (m.id === maintenanceId) {
        updatedMaint = {
          ...m,
          status: 'CLOSED',
          cost,
          endDate: nowStr,
          updatedAt: nowStr
        };
        return updatedMaint;
      }
      return m;
    }));

    // Release vehicle back to available if not retired
    if (vehicle.status !== 'RETIRED') {
      setVehicles(prev => prev.map(v => v.id === maint.vehicleId ? { ...v, status: 'AVAILABLE' } : v));
    }

    // Record expense
    const nextExpId = `E-${expenses.length + 601}`;
    const newExpense: Expense = {
      id: nextExpId,
      vehicleId: maint.vehicleId,
      vehicleName: maint.vehicleName,
      expenseType: 'Maintenance',
      amount: cost,
      description: `Resolved maintenance: ${maint.maintenanceType}`,
      date: nowStr
    };
    setExpenses(prev => [newExpense, ...prev]);

    if (!updatedMaint) throw new Error('Maintenance not found');
    return updatedMaint;
  };

  // Fuel Functions
  const addFuelLog = async (fuelData: Omit<FuelLog, 'id'>): Promise<FuelLog> => {
    const nextIdNum = fuelLogs.length > 0 
      ? Math.max(...fuelLogs.map(f => parseInt(f.id.replace(/\D/g, '') || '0'))) + 1 
      : 701;
    const newId = `FL-${nextIdNum}`;
    const newFuelLog: FuelLog = { ...fuelData, id: newId };
    setFuelLogs(prev => [newFuelLog, ...prev]);
    return newFuelLog;
  };

  // Expense Functions
  const createExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    const nextIdNum = expenses.length > 0 
      ? Math.max(...expenses.map(e => parseInt(e.id.replace(/\D/g, '') || '0'))) + 1 
      : 601;
    const newId = `E-${nextIdNum}`;
    const newExpense: Expense = { ...expenseData, id: newId };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = async (expenseId: string, expenseData: Partial<Omit<Expense, 'id'>>): Promise<Expense> => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) throw new Error('Expense not found');
    const updatedExpense = { ...expense, ...expenseData };
    setExpenses(prev => prev.map(e => e.id === expenseId ? updatedExpense : e));
    return updatedExpense;
  };

  const deleteExpense = async (expenseId: string): Promise<void> => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const resetAll = () => {
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setTrips(INITIAL_TRIPS);
    setMaintenance(INITIAL_MAINTENANCE);
    setExpenses(INITIAL_EXPENSES);
    setFuelLogs(INITIAL_FUEL_LOGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFilters({ vehicleType: 'all', status: 'all', region: 'all' });
    setSearchQuery('');
  };

  // Backward compatibility functions
  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip => {
    const nextIdNum = trips.length > 0 
      ? Math.max(...trips.map(t => parseInt(t.id.replace(/\D/g, '') || '0'))) + 1 
      : 9001;
    const newId = `T${nextIdNum}`;
    const nowStr = new Date().toISOString();
    const driverObj = drivers.find(d => d.id === tripData.driverId);
    const vehicleObj = vehicles.find(v => v.id === tripData.vehicleId);
    const newTrip: Trip = {
      ...tripData,
      id: newId,
      driverName: driverObj?.name || tripData.driverName || '',
      vehicleName: vehicleObj?.name || tripData.vehicleName || '',
      createdAt: nowStr,
      updatedAt: nowStr
    };
    setTrips(prev => [newTrip, ...prev]);
    if (newTrip.status === 'DISPATCHED') {
      if (tripData.vehicleId) {
        setVehicles(prev => prev.map(v => v.id === tripData.vehicleId ? { ...v, status: 'ON_TRIP' } : v));
      }
      if (tripData.driverId) {
        setDrivers(prev => prev.map(d => d.id === tripData.driverId ? { ...d, status: 'ON_TRIP' } : d));
      }
    }
    return newTrip;
  };

  const sendToMaintenance = (vehicleId: string, type: string, description: string): void => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    const nowStr = new Date().toISOString();
    const nextMaintId = `M-${maintenance.length + 501}`;
    const newMaint: Maintenance = {
      id: nextMaintId,
      vehicleId,
      vehicleName: vehicle.name,
      maintenanceType: type,
      description,
      status: 'OPEN',
      startDate: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr
    };
    setMaintenance(prev => [newMaint, ...prev]);
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'IN_SHOP' } : v));
  };

  const oldDispatchTrip = (tripId: string): void => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'DISPATCHED',
          dispatchDate: new Date().toISOString(),
          eta: 'En Route',
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const oldCompleteTrip = (tripId: string, finalOdometer: number, fuelUsed: number): void => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const nowStr = new Date().toISOString();
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'COMPLETED',
          completionDate: nowStr,
          finalOdometer,
          fuelUsed,
          eta: '-',
          updatedAt: nowStr
        };
      }
      return t;
    }));
    if (trip.vehicleId) {
      setVehicles(prev => prev.map(v => {
        if (v.id === trip.vehicleId) {
          return {
            ...v,
            odometer: finalOdometer,
            status: 'AVAILABLE'
          };
        }
        return v;
      }));
      if (fuelUsed > 0) {
        const nextFuelId = `FL-${fuelLogs.length + 701}`;
        const newFuelLog: FuelLog = {
          id: nextFuelId,
          vehicleId: trip.vehicleId,
          vehicleName: trip.vehicleName,
          tripId: tripId,
          liters: fuelUsed,
          cost: fuelUsed * 100,
          date: nowStr
        };
        setFuelLogs(prev => [newFuelLog, ...prev]);
        const nextExpId = `E-${expenses.length + 601}`;
        const newExpense: Expense = {
          id: nextExpId,
          vehicleId: trip.vehicleId,
          vehicleName: trip.vehicleName,
          expenseType: 'Fuel',
          amount: fuelUsed * 100,
          description: `Fuel purchase for Trip ${tripId}`,
          date: nowStr
        };
        setExpenses(prev => [newExpense, ...prev]);
      }
    }
    if (trip.driverId) {
      setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, status: 'AVAILABLE' } : d));
    }
  };

  const oldCancelTrip = (tripId: string, reason: string): void => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'CANCELLED',
          eta: reason || 'Cancelled by operator',
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const oldResolveMaintenance = (maintenanceId: string, cost: number): void => {
    const maint = maintenance.find(m => m.id === maintenanceId);
    if (!maint) return;
    const nowStr = new Date().toISOString();
    setMaintenance(prev => prev.map(m => {
      if (m.id === maintenanceId) {
        return {
          ...m,
          status: 'CLOSED',
          cost,
          endDate: nowStr,
          updatedAt: nowStr
        };
      }
      return m;
    }));
    setVehicles(prev => prev.map(v => v.id === maint.vehicleId ? { ...v, status: 'AVAILABLE' } : v));
    const nextExpId = `E-${expenses.length + 601}`;
    const newExpense: Expense = {
      id: nextExpId,
      vehicleId: maint.vehicleId,
      vehicleName: maint.vehicleName,
      expenseType: 'Maintenance',
      amount: cost,
      description: `Resolved maintenance: ${maint.maintenanceType}`,
      date: nowStr
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenance,
        expenses,
        fuelLogs,
        auditLogs,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        createDriver,
        updateDriver,
        deleteDriver,
        updateDriverSafetyScore,
        suspendDriver,
        createTripDraft,
        cancelTrip,
        dispatchTrip,
        completeTrip,
        createMaintenance,
        resolveMaintenance,
        addFuelLog,
        createExpense,
        updateExpense,
        deleteExpense,
        resetAll,
        // Backward compatibility
        createTrip,
        sendToMaintenance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
