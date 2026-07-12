'use client';

import React, { useState } from 'react';
import { useDashboardKPIs, useTrips, useVehicles, useDrivers } from '@/hooks/queries';
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/ui/DataStates';
import { TripStatus } from '@/types';
import {
  TrendingUp,
  Truck,
  Users,
  Route,
  Wrench,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const DashboardView = () => {
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useDashboardKPIs();

  const { data: trips = [], isLoading: tripsLoading, error: tripsError } = useTrips();
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();

  const [filters, setFilters] = useState({ vehicleType: 'all', status: 'all', region: 'all' });

  // Filter trips based on vehicle type, status, and region
  const filteredTrips = trips.filter((trip: any) => {
    if (filters.vehicleType !== 'all') {
      const veh = vehicles.find((v: any) => v.id === trip.vehicleId);
      if (!veh || veh.type?.toLowerCase() !== filters.vehicleType.toLowerCase()) return false;
    }
    if (filters.status !== 'all') {
      if (trip.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
    }
    if (filters.region !== 'all') {
      const veh = vehicles.find((v: any) => v.id === trip.vehicleId);
      if (!veh || veh.region?.toLowerCase() !== filters.region.toLowerCase()) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { style: string; icon: React.ReactNode; label: string }> = {
      'Dispatched': { style: 'bg-secondary-container/20 text-secondary', icon: <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />, label: 'On Trip' },
      'Completed': { style: 'bg-tertiary-container/20 text-tertiary', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Completed' },
      'Draft': { style: 'bg-surface-variant/40 text-on-surface-variant', icon: <Clock className="w-3.5 h-3.5" />, label: 'Draft' },
      'Cancelled': { style: 'bg-error-container/20 text-error', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelled' },
    };

    const config = statusMap[status] || { style: 'bg-surface-variant/40 text-on-surface-variant', icon: <Clock className="w-3.5 h-3.5" />, label: status };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.style}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (kpisLoading) return <LoadingSpinner />;
  if (kpisError) return <ErrorState error={kpisError as Error} />;

  const kpiValues = {
    activeVehicles: kpis?.vehicles?.active ?? 0,
    availableVehicles: kpis?.vehicles?.available ?? 0,
    inMaintenance: kpis?.vehicles?.inShop ?? 0,
    activeTrips: kpis?.trips?.active ?? 0,
    pendingTrips: kpis?.trips?.pending ?? 0,
    driversOnDuty: kpis?.drivers?.onDuty ?? 0,
    fleetUtilization: kpis?.fleetUtilizationPercentage ?? 0
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-container p-5 rounded-2xl border border-outline-variant">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Vehicle Type</label>
          <select
            value={filters.vehicleType}
            onChange={(e) => setFilters((prev) => ({ ...prev, vehicleType: e.target.value }))}
            className="px-4 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:border-primary cursor-pointer min-w-[160px]"
          >
            <option value="all">Vehicle Type: All</option>
            <option value="van">Van</option>
            <option value="tractor-trailer">Tractor-Trailer</option>
            <option value="medium cargo vehicle">Medium Cargo</option>
            <option value="heavy truck">Heavy Truck</option>
            <option value="mini-truck">Mini-Truck</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Trip Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:border-primary cursor-pointer min-w-[160px]"
          >
            <option value="all">Status: All</option>
            <option value="draft">Draft</option>
            <option value="dispatched">On Trip / Dispatched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Region</label>
          <select
            value={filters.region}
            onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
            className="px-4 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:border-primary cursor-pointer min-w-[160px]"
          >
            <option value="all">Region: All</option>
            <option value="west">West</option>
            <option value="north">North</option>
            <option value="east">East</option>
            <option value="south">South</option>
          </select>
        </div>

        {(filters.vehicleType !== 'all' || filters.status !== 'all' || filters.region !== 'all') && (
          <button
            onClick={() => setFilters({ vehicleType: 'all', status: 'all', region: 'all' })}
            className="mt-5 px-4 py-2 text-xs font-semibold text-primary hover:text-on-primary bg-primary-container hover:bg-primary rounded-xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Active Vehicles */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-secondary-container flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:scale-110 transition-all duration-200">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Vehicles</p>
            <h3 className="font-display-lg text-on-surface mt-1">{kpiValues.activeVehicles}</h3>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-tertiary font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3% vs last week</span>
          </div>
        </div>

        {/* Available Vehicles */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-tertiary flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container group-hover:scale-110 transition-all duration-200">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Available Vehicles</p>
            <h3 className="font-display-lg text-on-surface mt-1">{kpiValues.availableVehicles}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">Ready for dispatch</p>
        </div>

        {/* In Maintenance */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-primary-container flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container group-hover:scale-110 transition-all duration-200">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">In Maintenance</p>
            <h3 className="font-display-lg text-on-surface mt-1">
              {String(kpiValues.inMaintenance).padStart(2, '0')}
            </h3>
          </div>
          <p className="text-[10px] text-primary font-semibold mt-2">Under inspection</p>
        </div>

        {/* Active Trips */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-secondary flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:scale-110 transition-all duration-200">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Trips</p>
            <h3 className="font-display-lg text-on-surface mt-1">{kpiValues.activeTrips}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">Currently en route</p>
        </div>

        {/* Pending Trips */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-outline flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface group-hover:scale-110 transition-all duration-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pending Trips</p>
            <h3 className="font-display-lg text-on-surface mt-1">
              {String(kpiValues.pendingTrips).padStart(2, '0')}
            </h3>
          </div>
          <p className="text-[10px] text-secondary-fixed font-semibold mt-2">Awaiting dispatch</p>
        </div>

        {/* Drivers on Duty */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-secondary-fixed flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed group-hover:scale-110 transition-all duration-200">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Drivers on Duty</p>
            <h3 className="font-display-lg text-on-surface mt-1">{kpiValues.driversOnDuty}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">Active shifts</p>
        </div>

        {/* Fleet Utilization */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-tertiary-fixed-dim flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed-dim group-hover:scale-110 transition-all duration-200">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fleet Utilization</p>
            <h3 className="font-display-lg text-on-surface mt-1">{kpiValues.fleetUtilization}%</h3>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-tertiary-fixed-dim h-full rounded-full transition-all duration-500"
              style={{ width: `${kpiValues.fleetUtilization}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant p-6 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-on-surface">Recent Trips</h2>
            <p className="text-xs text-on-surface-variant">Status logs of latest fleet assignments</p>
          </div>
        </div>

        {tripsLoading ? (
          <LoadingSpinner />
        ) : tripsError ? (
          <ErrorState error={tripsError as Error} />
        ) : filteredTrips.length === 0 ? (
          <EmptyState title="No trips found" message="No trips match the current filters" />
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-highest">
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trip</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Vehicle</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Driver</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">ETA / Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredTrips.slice(0, 5).map((trip: any) => (
                  <tr key={trip.id} className="hover:bg-surface-container-highest transition-colors group">
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {trip.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-on-surface-variant">{trip.vehicle?.name || trip.vehicleName || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-on-surface-variant">{trip.driver?.name || trip.driverName || '—'}</span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(trip.status)}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-on-surface-variant">{trip.eta || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
