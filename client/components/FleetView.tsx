'use client';

import React, { useState } from 'react';
import { useAppContext } from '../providers/AppProvider';
import { Truck, Wrench, ShieldAlert, BadgeInfo, CheckCircle } from 'lucide-react';
import { VehicleStatus } from '../types';

export const FleetView = () => {
  const { vehicles, sendToMaintenance } = useAppContext();
  const [maintenanceType, setMaintenanceType] = useState('Routine Inspection');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3 h-3" />
            Available
          </span>
        );
      case 'ON_TRIP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            On Trip
          </span>
        );
      case 'IN_SHOP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Wrench className="w-3 h-3" />
            In Shop
          </span>
        );
      case 'RETIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            Retired
          </span>
        );
    }
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;

    sendToMaintenance(selectedVehicleId, maintenanceType, maintenanceDesc);
    setIsMaintModalOpen(false);
    setMaintenanceDesc('');
    alert('Vehicle sent to maintenance shop.');
  };

  return (
    <div className="space-y-6">
      {/* Fleet Summary Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-zinc-800">Fleet Inventory</h2>
          <p className="text-xs text-zinc-400">Total active assets: {vehicles.filter(v => v.status !== 'RETIRED').length} vehicles</p>
        </div>
        <button
          onClick={() => {
            const avail = vehicles.filter(v => v.status === 'AVAILABLE');
            if (avail.length === 0) {
              alert('No available vehicles to send to shop!');
              return;
            }
            setSelectedVehicleId(avail[0].id);
            setIsMaintModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5" />
          Send Vehicle to Shop
        </button>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Reg Number</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Asset Name</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Model</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Capacity</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Odometer (km)</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Region</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-sm text-zinc-800">{v.registrationNumber}</td>
                  <td className="py-4 px-6 text-sm text-zinc-700">{v.name}</td>
                  <td className="py-4 px-6 text-sm text-zinc-500">{v.model}</td>
                  <td className="py-4 px-6 text-sm text-zinc-600">{v.type}</td>
                  <td className="py-4 px-6 text-sm text-zinc-600">{v.capacity.toLocaleString()} kg</td>
                  <td className="py-4 px-6 text-sm text-zinc-600">{v.odometer.toLocaleString()} km</td>
                  <td className="py-4 px-6">{getStatusBadge(v.status)}</td>
                  <td className="py-4 px-6 text-sm text-zinc-500">{v.region || '—'}</td>
                  <td className="py-4 px-6 text-right text-xs">
                    {v.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          setIsMaintModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
                      >
                        Initiate Maintenance
                      </button>
                    ) : (
                      <span className="text-zinc-400 italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Scheduling Modal */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 w-full max-w-md p-6 relative">
            <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              Schedule Maintenance
            </h3>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Selected Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50 cursor-pointer"
                >
                  {vehicles
                    .filter((v) => v.status === 'AVAILABLE')
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.registrationNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Maintenance Type</label>
                <select
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50 cursor-pointer"
                >
                  <option value="Routine Inspection">Routine Inspection</option>
                  <option value="Engine Tuning">Engine Tuning</option>
                  <option value="Brake Replacement">Brake Replacement</option>
                  <option value="Suspension Overhaul">Suspension Overhaul</option>
                  <option value="Body & Paint repair">Body & Paint repair</option>
                  <option value="Tire Rotation">Tire Rotation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Problem Description</label>
                <textarea
                  required
                  value={maintenanceDesc}
                  onChange={(e) => setMaintenanceDesc(e.target.value)}
                  placeholder="Detail any symptoms or replacement requirements..."
                  rows={3}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Confirm Send
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-4 py-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
