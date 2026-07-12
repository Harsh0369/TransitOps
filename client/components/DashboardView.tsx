'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/providers/AppProvider';
import { TripStatus } from '@/types';
import {
  TrendingUp,
  Truck,
  Users,
  Route,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play
} from 'lucide-react';

export const DashboardView = () => {
  const {
    vehicles,
    drivers,
    trips,
    filters,
    setFilters,
    searchQuery,
    setActiveTab,
    dispatchTrip,
    cancelTrip,
    completeTrip
  } = useAppContext();

  const [dispatchingTripId, setDispatchingTripId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Dynamic calculations
  const activeVehCount = vehicles.filter((v) => v.status === 'ON_TRIP').length;
  const availVehCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const shopVehCount = vehicles.filter((v) => v.status === 'IN_SHOP').length;
  const activeTripCount = trips.filter((t) => t.status === 'DISPATCHED').length;
  const pendingTripCount = trips.filter((t) => t.status === 'DRAFT').length;
  const driversOnDuty = drivers.filter((d) => d.status === 'ON_TRIP' || d.status === 'AVAILABLE').length;

  const displayActiveVehicles = activeVehCount;
  const displayAvailableVehicles = availVehCount;
  const displayInMaintenance = shopVehCount;
  const displayActiveTrips = activeTripCount;
  const displayPendingTrips = pendingTripCount;
  const displayDriversOnDuty = driversOnDuty;

  const totalVehicles = vehicles.length;
  const totalAvailableVehicles = vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'ON_TRIP').length;
  const fleetUtilization = totalAvailableVehicles > 0 
    ? Math.round((activeVehCount / totalAvailableVehicles) * 100) 
    : 0;

  // Apply filters and search query
  const filteredTrips = trips.filter((trip) => {
    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      trip.id.toLowerCase().includes(searchLower) ||
      (trip.vehicleName || '').toLowerCase().includes(searchLower) ||
      (trip.driverName || '').toLowerCase().includes(searchLower) ||
      trip.source.toLowerCase().includes(searchLower) ||
      trip.destination.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Filters
    // 1. Vehicle Type
    if (filters.vehicleType !== 'all') {
      const veh = vehicles.find((v) => v.id === trip.vehicleId);
      if (!veh || veh.type.toLowerCase() !== filters.vehicleType.toLowerCase()) return false;
    }

    // 2. Status
    if (filters.status !== 'all') {
      if (trip.status.toLowerCase() !== filters.status.toLowerCase()) return false;
    }

    // 3. Region
    if (filters.region !== 'all') {
      const veh = vehicles.find((v) => v.id === trip.vehicleId);
      if (!veh || veh.region?.toLowerCase() !== filters.region.toLowerCase()) return false;
    }

    return true;
  });

  // Vehicle status proportions for chart
  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const activeCount = vehicles.filter((v) => v.status === 'ON_TRIP').length;
  const inShopCount = vehicles.filter((v) => v.status === 'IN_SHOP').length;
  const retiredCount = vehicles.filter((v) => v.status === 'RETIRED').length;

  const vehicleStatusBars = [
    { name: 'Available', count: availableCount, width: availableCount > 0 ? `${(availableCount / (availableCount + activeCount + inShopCount + retiredCount)) * 100}%` : '0%', barClass: 'bg-tertiary' },
    { name: 'On Trip', count: activeCount, width: activeCount > 0 ? `${(activeCount / (availableCount + activeCount + inShopCount + retiredCount)) * 100}%` : '0%', barClass: 'bg-secondary-container' },
    { name: 'In Shop (Maintenance)', count: inShopCount, width: inShopCount > 0 ? `${(inShopCount / (availableCount + activeCount + inShopCount + retiredCount)) * 100}%` : '0%', barClass: 'bg-primary-container' },
    { name: 'Retired / Spare', count: retiredCount, width: retiredCount > 0 ? `${(retiredCount / (availableCount + activeCount + inShopCount + retiredCount)) * 100}%` : '0%', barClass: 'bg-error' },
  ];

  const tripStatusStyle: Record<string, string> = {
    "On Trip":    "bg-secondary-container/20 text-secondary",
    "Completed":  "bg-tertiary-container/20 text-tertiary",
    "Dispatched": "bg-secondary/20 text-secondary-fixed",
    "Draft":      "bg-surface-variant/40 text-on-surface-variant",
  };

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${tripStatusStyle["On Trip"]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            On Trip
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${tripStatusStyle["Completed"]}`}>
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'DRAFT':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${tripStatusStyle["Draft"]}`}>
            <Clock className="w-3.5 h-3.5" />
            Draft
          </span>
        );
      case 'CANCELLED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-error-container/20 text-error`}>
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
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
        {/* KPI 1 */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-secondary-container flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:scale-110 transition-all duration-200">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Vehicles</p>
            <h3 className="font-display-lg text-on-surface mt-1">{displayActiveVehicles}</h3>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-tertiary font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3% vs last week</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-tertiary flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container group-hover:scale-110 transition-all duration-200">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Available Vehicles</p>
            <h3 className="font-display-lg text-on-surface mt-1">{displayAvailableVehicles}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">Ready for dispatch</p>
        </div>

        {/* KPI 3 */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-primary-container flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container group-hover:scale-110 transition-all duration-200">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">In Maintenance</p>
            <h3 className="font-display-lg text-on-surface mt-1">
              {String(displayInMaintenance).padStart(2, '0')}
            </h3>
          </div>
          <p className="text-[10px] text-primary font-semibold mt-2">Under inspection</p>
        </div>

        {/* KPI 4 */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-secondary flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:scale-110 transition-all duration-200">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Trips</p>
            <h3 className="font-display-lg text-on-surface mt-1">{displayActiveTrips}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">Currently en route</p>
        </div>

        {/* KPI 5 */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-outline flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface group-hover:scale-110 transition-all duration-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pending Trips</p>
            <h3 className="font-display-lg text-on-surface mt-1">
              {String(displayPendingTrips).padStart(2, '0')}
            </h3>
          </div>
          <p className="text-[10px] text-secondary-fixed font-semibold mt-2">Awaiting dispatch</p>
        </div>

        {/* KPI 6 */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-secondary-fixed flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed group-hover:scale-110 transition-all duration-200">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Drivers on Duty</p>
            <h3 className="font-display-lg text-on-surface mt-1">{displayDriversOnDuty}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">Active shifts</p>
        </div>

        {/* KPI 7 */}
        <div className="metric-card bg-surface-container border border-outline-variant p-4 border-l-tertiary-fixed-dim flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed-dim group-hover:scale-110 transition-all duration-200">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fleet Utilization</p>
            <h3 className="font-display-lg text-on-surface mt-1">{fleetUtilization}%</h3>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-tertiary-fixed-dim h-full rounded-full transition-all duration-500"
              style={{ width: `${fleetUtilization}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Trips & Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-surface-container rounded-2xl border border-outline-variant p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-on-surface">Recent Trips</h2>
              <p className="text-xs text-on-surface-variant">Status logs of latest fleet assignments</p>
            </div>
            <button
              onClick={() => setActiveTab('trips')}
              className="text-xs font-semibold text-primary hover:text-on-primary bg-primary-container hover:bg-primary rounded-lg transition-colors cursor-pointer px-3 py-1"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-highest">
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trip</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Vehicle</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Driver</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">ETA / Info</th>
                  <th className="py-3 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredTrips.slice(0, 5).map((trip) => (
                  <tr key={trip.id} className="hover:bg-surface-container-highest transition-colors group">
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {trip.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-on-surface-variant">{trip.vehicleName || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-on-surface-variant">{trip.driverName || '—'}</span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(trip.status)}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-on-surface-variant">{trip.eta || '—'}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {trip.status === 'DRAFT' && dispatchingTripId === trip.id && (
                        <div className="flex flex-col gap-2 items-end">
                          <select
                            value={selectedDriverId}
                            onChange={(e) => setSelectedDriverId(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
                          >
                            <option value="">Select Driver</option>
                            {drivers
                              .filter(d => d.status === 'AVAILABLE')
                              .map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                          </select>
                          <select
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary"
                          >
                            <option value="">Select Vehicle</option>
                            {vehicles
                              .filter(v => v.status === 'AVAILABLE')
                              .map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.name}
                                </option>
                              ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (selectedDriverId && selectedVehicleId) {
                                  dispatchTrip(trip.id, selectedDriverId, selectedVehicleId);
                                  setDispatchingTripId(null);
                                  setSelectedDriverId('');
                                  setSelectedVehicleId('');
                                } else {
                                  alert('Please select both a driver and a vehicle');
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] font-semibold text-tertiary bg-tertiary-container hover:bg-tertiary hover:text-on-tertiary border border-tertiary-container rounded-lg transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                setDispatchingTripId(null);
                                setSelectedDriverId('');
                                setSelectedVehicleId('');
                              }}
                              className="px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-highest hover:bg-outline-variant border border-outline rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {trip.status === 'DRAFT' && dispatchingTripId !== trip.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDispatchingTripId(trip.id)}
                            title="Dispatch"
                            className="p-1.5 text-primary hover:bg-primary-container rounded-lg transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter cancellation reason:', 'Awaiting driver');
                              if (reason !== null) {
                                cancelTrip(trip.id, reason);
                              }
                            }}
                            title="Cancel"
                            className="p-1.5 text-error hover:bg-error-container rounded-lg transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {trip.status === 'DISPATCHED' && (
                        <button
                          onClick={() => {
                            const odom = prompt('Enter final odometer readings:', '46000');
                            const fuel = prompt('Enter fuel used in liters (optional):', '10');
                            if (odom) {
                              const odomNum = parseFloat(odom);
                              const fuelNum = fuel ? parseFloat(fuel) : 0;
                              completeTrip(trip.id, odomNum, fuelNum);
                            }
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold text-tertiary bg-tertiary-container hover:bg-tertiary hover:text-on-tertiary border border-tertiary-container rounded-lg transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {trip.status === 'COMPLETED' && (
                        <span className="text-xs text-on-surface-variant italic">No actions</span>
                      )}
                      {trip.status === 'CANCELLED' && (
                        <span className="text-xs text-error italic">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTrips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-sm text-on-surface-variant">
                      No matching trips found. Try checking other filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Distribution Chart */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-on-surface">Vehicle Status</h2>
            <p className="text-xs text-on-surface-variant">Current allocation across fleet database</p>
          </div>

          <div className="space-y-4 my-6">
            {vehicleStatusBars.map((bar) => (
              <div key={bar.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant">{bar.name}</span>
                  <span className="text-on-surface">{bar.count} Units</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden relative">
                  <div
                    className={`${bar.barClass} h-full rounded-full transition-all duration-1000`}
                    style={{ width: bar.width }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
            <div className="flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-on-surface">Dispatcher Tip:</span>
                <p className="text-on-surface-variant mt-0.5">
                  Assign available drivers to pending draft routes inside the{' '}
                  <button
                    onClick={() => setActiveTab('dispatcher')}
                    className="text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Trip Dispatcher
                  </button>{' '}
                  tab to improve active utilization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
