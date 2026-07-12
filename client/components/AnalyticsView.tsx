'use client';

import React from 'react';
import { useTrips, useExpenses, useVehicles, useDrivers, useFuelLogs } from '../hooks/queries';
import { BarChart3, TrendingUp, ShieldCheck, Fuel, Wrench, Coins } from 'lucide-react';

export const AnalyticsView = () => {
  const { data: trips = [], isLoading: tripsLoading } = useTrips();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: drivers = [], isLoading: driversLoading } = useDrivers();
  const { data: fuelLogs = [], isLoading: fuelLoading } = useFuelLogs();
  
  const isLoading = tripsLoading || expensesLoading || vehiclesLoading || driversLoading || fuelLoading;

  // Calculations
  const completedTrips = trips.filter((t: any) => t.status === 'COMPLETED');
  const totalCargo = completedTrips.reduce((sum: number, t: any) => sum + t.cargoWeight, 0);
  const totalDistance = completedTrips.reduce((sum: number, t: any) => sum + (t.distance || 0), 0);
  
  const fuelExpenses = expenses.filter((e: any) => e.expenseType === 'Fuel').reduce((sum: number, e: any) => sum + e.amount, 0);
  const maintenanceExpenses = expenses.filter((e: any) => e.expenseType === 'Maintenance').reduce((sum: number, e: any) => sum + e.amount, 0);
  const otherExpenses = expenses.filter((e: any) => e.expenseType !== 'Fuel' && e.expenseType !== 'Maintenance').reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSpend = fuelExpenses + maintenanceExpenses + otherExpenses;

  // Fuel efficiency (km per liter)
  const totalFuelLiters = fuelLogs.reduce((sum: number, f: any) => sum + f.liters, 0);
  const fleetAvgMileage = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : '0.00';
  
  const avgSafetyScore = drivers.length > 0 
    ? Math.round(drivers.reduce((sum: number, d: any) => sum + (d.safetyScore || 100), 0) / drivers.length)
    : 100;
  
  // ROI (simplified: assume some revenue, e.g., cargo * 10)
  const revenue = totalCargo * 10;
  const roi = totalSpend > 0 ? (((revenue - totalSpend) / totalSpend) * 100).toFixed(2) : '0';

  // Fleet utilization
  const activeVehicles = vehicles.filter((v: any) => v.status === 'ON_TRIP').length;
  const totalActiveVehicles = vehicles.filter((v: any) => v.status !== 'RETIRED').length;
  const fleetUtilization = totalActiveVehicles > 0 
    ? Math.round((activeVehicles / totalActiveVehicles) * 100) 
    : 0;

  // CSS Charts mock items representing dates
  const dailyPayloadData = [
    { label: 'Mon', payload: 12000, color: 'bg-indigo-600' },
    { label: 'Tue', payload: 18000, color: 'bg-indigo-600' },
    { label: 'Wed', payload: 15000, color: 'bg-indigo-600' },
    { label: 'Thu', payload: 24000, color: 'bg-indigo-600' },
    { label: 'Fri', payload: 22000, color: 'bg-indigo-600' },
    { label: 'Sat', payload: 9000, color: 'bg-amber-500' },
    { label: 'Sun', payload: 6000, color: 'bg-amber-500' },
  ];

  const maxPayload = Math.max(...dailyPayloadData.map(d => d.payload));

  const costBreakdown = [
    { name: 'Fuel Purchases', value: fuelExpenses, percentage: 0, color: 'bg-indigo-600' },
    { name: 'Maintenance & Spares', value: maintenanceExpenses, percentage: 0, color: 'bg-amber-500' },
    { name: 'Tolls & Route Fees', value: otherExpenses, percentage: 0, color: 'bg-emerald-500' },
  ];

  const totalCostCombined = costBreakdown.reduce((sum, item) => sum + item.value, 0);
  costBreakdown.forEach(item => {
    item.percentage = totalCostCombined > 0 ? Math.round((item.value / totalCostCombined) * 100) : 0;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Operations Cost</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{isLoading ? '...' : `INR ${totalSpend.toLocaleString()}`}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cargo Transported</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{isLoading ? '...' : totalCargo.toLocaleString()} <span className="text-base text-zinc-500 font-medium">kg</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fuel Efficiency</p>
            <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{isLoading ? '...' : `${fleetAvgMileage} km/l`}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ROI</p>
            <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{isLoading ? '...' : `${roi}%`}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Safety Rating Average</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{isLoading ? '...' : avgSafetyScore} <span className="text-base text-zinc-500 font-medium">/ 100</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fleet Utilization</p>
            <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{isLoading ? '...' : `${fleetUtilization}%`}</h4>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Payload Chart */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-800">Weekly Consignment Load</h3>
            <p className="text-xs text-zinc-400">Total freight moved per day in kg</p>
          </div>

          {/* Bar Chart Container */}
          <div className="h-60 flex items-end justify-between gap-2.5 pt-8 pb-2 border-b border-zinc-100 px-4">
            {dailyPayloadData.map(d => {
              const heightPct = maxPayload > 0 ? (d.payload / maxPayload) * 100 : 0;
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                  {/* Tooltip on Hover */}
                  <span className="opacity-0 group-hover:opacity-100 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded absolute -translate-y-12 transition-opacity font-bold shadow-md z-10">
                    {d.payload.toLocaleString()} kg
                  </span>
                  
                  <div
                    className={`${d.color} w-full rounded-t-lg transition-all duration-500 hover:brightness-95`}
                    style={{ height: `${heightPct * 0.8}%` }}
                  ></div>
                  <span className="text-xs font-semibold text-zinc-400">{d.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 font-semibold">
            <span>Peak Day: Thursday (24,000 kg)</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              +12.4% vs prev week
            </span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{isLoading ? '...' : totalDistance.toLocaleString()} <span className="text-base text-zinc-500 font-medium">km</span></h3>
            <p className="text-xs text-zinc-400">Budget allocation across active transit ops</p>
          </div>

          <div className="space-y-4 my-6">
            {costBreakdown.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-600">{item.name}</span>
                  <span className="text-zinc-800">
                    INR {item.value.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-500">
            <span className="font-bold text-zinc-700 block mb-1">Financial Outlook</span>
            <p className="leading-relaxed">Fuel prices represent the largest cost component. Implementing driving safety and optimization metrics inside the Dispatcher Console can reduce consumption by 6-8%.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
