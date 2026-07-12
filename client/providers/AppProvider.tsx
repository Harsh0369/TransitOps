'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, Driver, Trip, Maintenance, Expense, FuelLog, TripStatus, AuditLog } from '../types';
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
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Trip;
  cancelTrip: (tripId: string, reason: string) => void;
  dispatchTrip: (tripId: string) => void;
  completeTrip: (tripId: string, finalOdometer: number, fuelUsed: number) => void;
  sendToMaintenance: (vehicleId: string, type: string, description: string) => void;
  resolveMaintenance: (maintenanceId: string, cost: number) => void;
  addAuditLog: (action: string, entity: string, entityId: string, oldValue?: any, newValue?: any, metadata?: any, reason?: string) => void;
  resetAll: () => void;
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
    // For example, if a vehicle is in an active trip, its status should be ON_TRIP.
    // If not, it should be AVAILABLE (unless it's in maintenance or retired).
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

  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextIdNum = trips.length > 0 
      ? Math.max(...trips.map(t => parseInt(t.id.replace(/\D/g, '') || '0'))) + 1 
      : 9001;
    const newId = `T${nextIdNum}`;
    
    const nowStr = new Date().toISOString();
    
    // Find driver and vehicle names if details were provided by ID
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

    // If dispatched, update vehicle and driver statuses immediately
    if (newTrip.status === 'DISPATCHED') {
      if (tripData.vehicleId) {
        setVehicles(prev => prev.map(v => v.id === tripData.vehicleId ? { ...v, status: 'ON_TRIP' } : v));
      }
      if (tripData.driverId) {
        setDrivers(prev => prev.map(d => d.id === tripData.driverId ? { ...d, status: 'ON_TRIP' } : d));
      }
    }

    addAuditLog(
      'TRIP_CREATED',
      'Trip',
      newId,
      null,
      {
        source: tripData.source,
        destination: tripData.destination,
        driverId: tripData.driverId,
        vehicleId: tripData.vehicleId,
        cargoWeight: tripData.cargoWeight,
        status: newTrip.status
      },
      { source: tripData.source, destination: tripData.destination }
    );

    if (newTrip.status === 'DISPATCHED') {
      addAuditLog(
        'TRIP_DISPATCHED',
        'Trip',
        newId,
        { status: 'DRAFT' },
        { status: 'DISPATCHED' },
        { driverId: tripData.driverId, vehicleId: tripData.vehicleId }
      );
    }

    return newTrip;
  };

  const cancelTrip = (tripId: string, reason: string) => {
    const trip = trips.find(t => t.id === tripId);
    const prevStatus = trip ? trip.status : 'UNKNOWN';

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

    addAuditLog(
      'TRIP_CANCELLED',
      'Trip',
      tripId,
      { status: prevStatus },
      { status: 'CANCELLED' },
      { previousStatus: prevStatus },
      reason
    );
  };

  const dispatchTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
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

    if (trip) {
      addAuditLog(
        'TRIP_DISPATCHED',
        'Trip',
        tripId,
        { status: trip.status },
        { status: 'DISPATCHED' },
        { driverId: trip.driverId, vehicleId: trip.vehicleId }
      );
    }
  };

  const completeTrip = (tripId: string, finalOdometer: number, fuelUsed: number) => {
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
  };

  const sendToMaintenance = (vehicleId: string, type: string, description: string) => {
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
  };

  const resolveMaintenance = (maintenanceId: string, cost: number) => {
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

    // Release vehicle back to available
    setVehicles(prev => prev.map(v => v.id === maint.vehicleId ? { ...v, status: 'AVAILABLE' } : v));

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

    addAuditLog(
      'MAINTENANCE_CLOSED',
      'Maintenance',
      maintenanceId,
      { status: maint.status },
      { status: 'CLOSED', cost },
      { cost }
    );
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
        createTrip,
        cancelTrip,
        dispatchTrip,
        completeTrip,
        sendToMaintenance,
        resolveMaintenance,
        addAuditLog,
        resetAll
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