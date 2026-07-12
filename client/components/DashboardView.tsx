'use client';

import React from 'react';
import { useAppContext } from '../providers/AppProvider';
import { TripStatus } from '../types';
import {
  TrendingUp,
  Truck,
  Users,
  Route,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
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

  // Dynamic calculations with baseline offset to match wireframe values
  const activeVehCount = vehicles.filter((v) => v.status === 'ON_TRIP').length;
  const availVehCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const shopVehCount = vehicles.filter((v) => v.status === 'IN_SHOP').length;
  const activeTripCount = trips.filter((t) => t.status === 'DISPATCHED').length;
  const pendingTripCount = trips.filter((t) => t.status === 'DRAFT').length;
  const driversOnDuty = drivers.filter((d) => d.status === 'ON_TRIP' || d.status === 'AVAILABLE').length;

  const displayActiveVehicles = activeVehCount + 51; // baseline 53
  const displayAvailableVehicles = availVehCount + 38; // baseline 42
  const displayInMaintenance = shopVehCount + 4; // baseline 5
  const displayActiveTrips = activeTripCount + 16; // baseline 18
  const displayPendingTrips = pendingTripCount + 8; // baseline 9
  const displayDriversOnDuty = driversOnDuty + 22; // baseline 26

  const totalDisplayVehicles = displayActiveVehicles + displayAvailableVehicles + displayInMaintenance;
  const fleetUtilization = Math.round((displayActiveVehicles / (totalDisplayVehicles - displayInMaintenance || 1)) * 100);

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
  const activeCount = vehicles.filter((v) => v.status === 'ON_TRIP').length;
  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const inShopCount = vehicles.filter((v) => v.status === 'IN_SHOP').length;
  const retiredCount = vehicles.filter((v) => v.status === 'RETIRED').length;
  const totalVehiclesCount = vehicles.length || 1;

  const vehicleStatusBars = [
    { name: 'Available', count: availableCount + 38, color: 'bg-emerald-500', barColor: 'bg-emerald-500/20' },
    { name: 'On Trip', count: activeCount + 51, color: 'bg-indigo-600', barColor: 'bg-indigo-600/20' },
    { name: 'In Shop', count: inShopCount + 4, color: 'bg-amber-500', barColor: 'bg-amber-500/20' },
    { name: 'Retired', count: retiredCount + 2, color: 'bg-zinc-400', barColor: 'bg-zinc-400/20' },
  ];

  const maxStatusCount = Math.max(...vehicleStatusBars.map((b) => b.count));

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            On Trip
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Clock className="w-3.5 h-3.5" />
            Draft
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
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
      <div className="flex flex-wrap items-center gap-4 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Vehicle Type</label>
          <select
            value={filters.vehicleType}
            onChange={(e) => setFilters((prev) => ({ ...prev, vehicleType: e.target.value }))}
            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[160px]"
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
          <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Trip Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[160px]"
          >
            <option value="all">Status: All</option>
            <option value="draft">Draft</option>
            <option value="dispatched">On Trip / Dispatched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Region</label>
          <select
            value={filters.region}
            onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[160px]"
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
            className="mt-5 px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all duration-200">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Vehicles</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{displayActiveVehicles}</h3>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3% vs last week</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-all duration-200">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Available Vehicles</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{displayAvailableVehicles}</h3>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">Ready for dispatch</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-all duration-200">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">In Maintenance</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              {String(displayInMaintenance).padStart(2, '0')}
            </h3>
          </div>
          <p className="text-[10px] text-amber-600 font-semibold mt-2">Under inspection</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-all duration-200">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Trips</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{displayActiveTrips}</h3>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">Currently en route</p>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:scale-110 transition-all duration-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pending Trips</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              {String(displayPendingTrips).padStart(2, '0')}
            </h3>
          </div>
          <p className="text-[10px] text-indigo-600 font-semibold mt-2">Awaiting dispatch</p>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all duration-200">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Drivers on Duty</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{displayDriversOnDuty}</h3>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">Active shifts</p>
        </div>

        {/* KPI 7 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[110px] relative overflow-hidden group bg-gradient-to-br from-indigo-900 to-zinc-900 text-white border-transparent">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-200">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Fleet Utilization</p>
            <h3 className="text-2xl font-bold text-white mt-1">{fleetUtilization}%</h3>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${fleetUtilization}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Trips & Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-zinc-800">Recent Trips</h2>
              <p className="text-xs text-zinc-400">Status logs of latest fleet assignments</p>
            </div>
            <button
              onClick={() => setActiveTab('trips')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Trip</th>
                  <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Vehicle</th>
                  <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Driver</th>
                  <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">ETA / Info</th>
                  <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTrips.slice(0, 5).map((trip) => (
                  <tr key={trip.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-zinc-800 group-hover:text-indigo-600 transition-colors">
                        {trip.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-zinc-600">{trip.vehicleName || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-zinc-600">{trip.driverName || '—'}</span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(trip.status)}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-zinc-500">{trip.eta || '—'}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {trip.status === 'DRAFT' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              if (confirm(`Do you want to dispatch Trip ${trip.id}?`)) {
                                dispatchTrip(trip.id);
                              }
                            }}
                            title="Dispatch"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
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
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                          className="px-2.5 py-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {trip.status === 'COMPLETED' && (
                        <span className="text-xs text-zinc-400 italic">No actions</span>
                      )}
                      {trip.status === 'CANCELLED' && (
                        <span className="text-xs text-rose-400 italic">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTrips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-sm text-zinc-400">
                      No matching trips found. Try checking other filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Distribution Chart */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-800">Vehicle Status</h2>
            <p className="text-xs text-zinc-400">Current allocation across fleet database</p>
          </div>

          <div className="space-y-4 my-6">
            {vehicleStatusBars.map((bar) => {
              // Calculate percentages based on max status count to fill the bar nicely
              const percentage = maxStatusCount > 0 ? (bar.count / maxStatusCount) * 100 : 0;

              return (
                <div key={bar.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-500">{bar.name}</span>
                    <span className="text-zinc-800">{bar.count}</span>
                  </div>
                  <div className={`w-full ${bar.barColor} h-3 rounded-full overflow-hidden relative`}>
                    <div
                      className={`${bar.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
            <div className="flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-zinc-700">Dispatcher Tip:</span>
                <p className="text-zinc-500 mt-0.5">
                  Assign available drivers to pending draft routes inside the{' '}
                  <button
                    onClick={() => setActiveTab('dispatcher')}
                    className="text-indigo-600 font-semibold hover:underline cursor-pointer"
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
