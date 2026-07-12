'use client';

import React, { useState } from 'react';
import { useAppContext } from '../providers/AppProvider';
import { FileSpreadsheet, Download, RefreshCw, BarChart2, Coins, Fuel, Percent } from 'lucide-react';

export const ReportsView = () => {
  const { vehicles, trips, expenses, fuelLogs, resetAll } = useAppContext();
  const [activeReportTab, setActiveReportTab] = useState<'utilization' | 'cost' | 'fuel' | 'roi'>('utilization');

  // Helper function to convert data to CSV and trigger download
  const handleExportCSV = (reportName: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          const str = String(val === undefined || val === null ? '' : val);
          // Escape commas and double quotes
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `transitops_${reportName}_report_${todayStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- REPORT 1: Fleet Utilization ---
  const getUtilizationData = () => {
    return vehicles.map(vehicle => {
      const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id);
      const completedTrips = vehicleTrips.filter(t => t.status === 'COMPLETED');
      const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
      
      // Calculate active utilization score
      const totalTripsCount = trips.length || 1;
      const utilizationRate = Math.round((vehicleTrips.length / totalTripsCount) * 100);

      return {
        id: vehicle.id,
        regNum: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        status: vehicle.status,
        tripsCount: vehicleTrips.length,
        completedCount: completedTrips.length,
        distance: totalDistance,
        utilizationRate
      };
    });
  };

  const exportUtilizationCSV = () => {
    const data = getUtilizationData();
    const headers = ['Vehicle ID', 'Registration Number', 'Asset Name', 'Type', 'Status', 'Total Trips', 'Completed Trips', 'Total Distance (km)', 'Utilization Rate (%)'];
    const rows = data.map(item => [
      item.id,
      item.regNum,
      item.name,
      item.type,
      item.status,
      item.tripsCount,
      item.completedCount,
      item.distance,
      item.utilizationRate
    ]);
    handleExportCSV('fleet_utilization', headers, rows);
  };

  // --- REPORT 2: Operational Cost ---
  const getCostData = () => {
    return vehicles.map(vehicle => {
      const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id);
      const fuelCost = vehicleExpenses.filter(e => e.expenseType === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
      const maintenanceCost = vehicleExpenses.filter(e => e.expenseType === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
      const otherCost = vehicleExpenses.filter(e => e.expenseType !== 'Fuel' && e.expenseType !== 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
      const totalCost = fuelCost + maintenanceCost + otherCost;

      return {
        id: vehicle.id,
        name: vehicle.name,
        regNum: vehicle.registrationNumber,
        fuelCost,
        maintenanceCost,
        otherCost,
        totalCost
      };
    });
  };

  const exportCostCSV = () => {
    const data = getCostData();
    const headers = ['Vehicle ID', 'Asset Name', 'Registration Number', 'Fuel Cost (INR)', 'Maintenance Cost (INR)', 'Other Expenses (INR)', 'Total Cost (INR)'];
    const rows = data.map(item => [
      item.id,
      item.name,
      item.regNum,
      item.fuelCost,
      item.maintenanceCost,
      item.otherCost,
      item.totalCost
    ]);
    handleExportCSV('operational_cost', headers, rows);
  };

  // --- REPORT 3: Fuel Efficiency ---
  const getFuelEfficiencyData = () => {
    return vehicles.map(vehicle => {
      const vehicleFuelLogs = fuelLogs.filter(fl => fl.vehicleId === vehicle.id);
      const totalLiters = vehicleFuelLogs.reduce((sum, fl) => sum + fl.liters, 0);
      const totalFuelCost = vehicleFuelLogs.reduce((sum, fl) => sum + fl.cost, 0);
      
      const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'COMPLETED');
      const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
      
      // Calculate efficiency: km per liter
      const efficiency = totalLiters > 0 ? parseFloat((totalDistance / totalLiters).toFixed(2)) : 0;

      return {
        id: vehicle.id,
        name: vehicle.name,
        regNum: vehicle.registrationNumber,
        totalLiters,
        totalDistance,
        efficiency,
        totalFuelCost
      };
    });
  };

  const exportFuelEfficiencyCSV = () => {
    const data = getFuelEfficiencyData();
    const headers = ['Vehicle ID', 'Asset Name', 'Registration Number', 'Total Fuel Used (Liters)', 'Total Distance (km)', 'Fuel Efficiency (km/L)', 'Total Fuel Cost (INR)'];
    const rows = data.map(item => [
      item.id,
      item.name,
      item.regNum,
      item.totalLiters,
      item.totalDistance,
      item.efficiency,
      item.totalFuelCost
    ]);
    handleExportCSV('fuel_efficiency', headers, rows);
  };

  // --- REPORT 4: Vehicle ROI ---
  const getROIData = () => {
    return vehicles.map(vehicle => {
      const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id);
      const totalCost = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'COMPLETED');
      const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
      
      // Assume a standard revenue model: 40 INR earned per kilometer traveled on completed cargo trips
      const estimatedRevenue = totalDistance * 40;
      const netReturn = estimatedRevenue - totalCost;
      
      // ROI = (Net Return / Acquisition Cost) * 100
      const roiPercentage = vehicle.acquisitionCost > 0 
        ? parseFloat(((netReturn / vehicle.acquisitionCost) * 100).toFixed(2))
        : 0;

      return {
        id: vehicle.id,
        name: vehicle.name,
        regNum: vehicle.registrationNumber,
        acquisitionCost: vehicle.acquisitionCost,
        estimatedRevenue,
        totalCost,
        netReturn,
        roiPercentage
      };
    });
  };

  const exportROICSV = () => {
    const data = getROIData();
    const headers = ['Vehicle ID', 'Asset Name', 'Registration Number', 'Acquisition Cost (INR)', 'Estimated Revenue (INR)', 'Total Expenses (INR)', 'Net Return (INR)', 'ROI (%)'];
    const rows = data.map(item => [
      item.id,
      item.name,
      item.regNum,
      item.acquisitionCost,
      item.estimatedRevenue,
      item.totalCost,
      item.netReturn,
      item.roiPercentage
    ]);
    handleExportCSV('vehicle_roi', headers, rows);
  };

  // Calculate global summary metrics across all reports
  const allCostData = getCostData();
  const grandTotalSpend = allCostData.reduce((sum, i) => sum + i.totalCost, 0);
  const totalFleetDistance = getUtilizationData().reduce((sum, i) => sum + i.distance, 0);
  const averageEfficiency = parseFloat((getFuelEfficiencyData().reduce((sum, i) => sum + i.efficiency, 0) / (vehicles.length || 1)).toFixed(2));
  const averageROI = parseFloat((getROIData().reduce((sum, i) => sum + i.roiPercentage, 0) / (vehicles.length || 1)).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Report Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Operational Cost</p>
            <h4 className="text-xl font-bold text-zinc-900 mt-0.5">INR {grandTotalSpend.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fleet Distance</p>
            <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{totalFleetDistance.toLocaleString()} km</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fuel Efficiency</p>
            <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{averageEfficiency} km/L</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Average ROI</p>
            <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{averageROI}%</h4>
          </div>
        </div>

      </div>

      {/* Navigation Submenu */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveReportTab('utilization')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeReportTab === 'utilization'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'hover:bg-zinc-100 text-zinc-600'
            }`}
          >
            Utilization Report
          </button>
          <button
            onClick={() => setActiveReportTab('cost')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeReportTab === 'cost'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'hover:bg-zinc-100 text-zinc-600'
            }`}
          >
            Operational Costs
          </button>
          <button
            onClick={() => setActiveReportTab('fuel')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeReportTab === 'fuel'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'hover:bg-zinc-100 text-zinc-600'
            }`}
          >
            Fuel Efficiency
          </button>
          <button
            onClick={() => setActiveReportTab('roi')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeReportTab === 'roi'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'hover:bg-zinc-100 text-zinc-600'
            }`}
          >
            Vehicle ROI
          </button>
        </div>

        {/* Master CSV Exporter Buttons based on active report */}
        <button
          onClick={() => {
            if (activeReportTab === 'utilization') exportUtilizationCSV();
            if (activeReportTab === 'cost') exportCostCSV();
            if (activeReportTab === 'fuel') exportFuelEfficiencyCSV();
            if (activeReportTab === 'roi') exportROICSV();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Report to CSV
        </button>
      </div>

      {/* Active Report Table Display */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        
        {activeReportTab === 'utilization' && (
          <div>
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Fleet Utilization Report</h3>
                <p className="text-xs text-zinc-400">Total operational time and trip involvement metrics per active asset.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="px-6 py-3.5">Vehicle ID</th>
                    <th className="px-6 py-3.5">Asset Name</th>
                    <th className="px-6 py-3.5">Reg Number</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-center">Total Trips</th>
                    <th className="px-6 py-3.5 text-center">Distance (km)</th>
                    <th className="px-6 py-3.5 text-right">Utilization Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {getUtilizationData().map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-3.5 text-zinc-400 font-semibold">{item.id}</td>
                      <td className="px-6 py-3.5 text-zinc-800">{item.name}</td>
                      <td className="px-6 py-3.5 font-mono text-zinc-600">{item.regNum}</td>
                      <td className="px-6 py-3.5 text-zinc-500">{item.type}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
                          item.status === 'ON_TRIP' ? 'bg-indigo-50 text-indigo-700' :
                          item.status === 'IN_SHOP' ? 'bg-amber-50 text-amber-700' :
                          'bg-zinc-100 text-zinc-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-zinc-700">{item.tripsCount}</td>
                      <td className="px-6 py-3.5 text-center text-zinc-700">{item.distance.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-indigo-600">{item.utilizationRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportTab === 'cost' && (
          <div>
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Operational Costs Report</h3>
                <p className="text-xs text-zinc-400">Granular log of expenses incurred per vehicle, including Fuel and Spares.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="px-6 py-3.5">Vehicle ID</th>
                    <th className="px-6 py-3.5">Asset Name</th>
                    <th className="px-6 py-3.5">Reg Number</th>
                    <th className="px-6 py-3.5 text-right">Fuel Cost</th>
                    <th className="px-6 py-3.5 text-right">Maintenance Cost</th>
                    <th className="px-6 py-3.5 text-right">Other Spend</th>
                    <th className="px-6 py-3.5 text-right">Total Operational Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {getCostData().map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-3.5 text-zinc-400 font-semibold">{item.id}</td>
                      <td className="px-6 py-3.5 text-zinc-800">{item.name}</td>
                      <td className="px-6 py-3.5 font-mono text-zinc-600">{item.regNum}</td>
                      <td className="px-6 py-3.5 text-right text-zinc-700">INR {item.fuelCost.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right text-zinc-700">INR {item.maintenanceCost.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right text-zinc-700">INR {item.otherCost.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-zinc-900">INR {item.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportTab === 'fuel' && (
          <div>
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Fuel Efficiency Report</h3>
                <p className="text-xs text-zinc-400">Total liters consumed vs distance completed, calculating average mileage.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="px-6 py-3.5">Vehicle ID</th>
                    <th className="px-6 py-3.5">Asset Name</th>
                    <th className="px-6 py-3.5">Reg Number</th>
                    <th className="px-6 py-3.5 text-center">Total Fuel (Liters)</th>
                    <th className="px-6 py-3.5 text-center">Distance Completed (km)</th>
                    <th className="px-6 py-3.5 text-right">Fuel Cost</th>
                    <th className="px-6 py-3.5 text-right">Average Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {getFuelEfficiencyData().map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-3.5 text-zinc-400 font-semibold">{item.id}</td>
                      <td className="px-6 py-3.5 text-zinc-800">{item.name}</td>
                      <td className="px-6 py-3.5 font-mono text-zinc-600">{item.regNum}</td>
                      <td className="px-6 py-3.5 text-center text-zinc-700">{item.totalLiters.toLocaleString()} L</td>
                      <td className="px-6 py-3.5 text-center text-zinc-700">{item.totalDistance.toLocaleString()} km</td>
                      <td className="px-6 py-3.5 text-right text-zinc-700">INR {item.totalFuelCost.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-emerald-600">{item.efficiency} km/L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportTab === 'roi' && (
          <div>
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Vehicle Return on Investment (ROI)</h3>
                <p className="text-xs text-zinc-400">Comparing acquisition cost against generated revenue and expenses to date.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="px-6 py-3.5">Vehicle ID</th>
                    <th className="px-6 py-3.5">Asset Name</th>
                    <th className="px-6 py-3.5 text-right">Acquisition Cost</th>
                    <th className="px-6 py-3.5 text-right">Est. Revenue</th>
                    <th className="px-6 py-3.5 text-right">Expenses</th>
                    <th className="px-6 py-3.5 text-right">Net Return</th>
                    <th className="px-6 py-3.5 text-right">ROI (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {getROIData().map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-3.5 text-zinc-400 font-semibold">{item.id}</td>
                      <td className="px-6 py-3.5 text-zinc-800">{item.name} ({item.regNum})</td>
                      <td className="px-6 py-3.5 text-right text-zinc-700">INR {item.acquisitionCost.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right text-emerald-600">INR {item.estimatedRevenue.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right text-rose-600">INR {item.totalCost.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right text-zinc-950 font-bold">INR {item.netReturn.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-indigo-600">{item.roiPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
