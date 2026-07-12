'use client';

import React, { useState } from 'react';
import { useMaintenance, useResolveMaintenance } from '../hooks/queries';
import { Wrench, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { MaintenanceStatus } from '../types';

export const MaintenanceView = () => {
  const { data: maintenance = [], isLoading } = useMaintenance();
  const { mutate: resolveMaintenance } = useResolveMaintenance();
  const [resolveCost, setResolveCost] = useState<number>(250);
  const [selectedMaintId, setSelectedMaintId] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Under Repair
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintId) return;

    resolveMaintenance({ id: selectedMaintId, cost: resolveCost });
    setIsResolveModalOpen(false);
    setResolveCost(250);
    alert('Vehicle maintenance resolved. Asset returned to service.');
  };

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[100px]">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Shop Orders</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              {isLoading ? '...' : maintenance.filter((m: any) => m.status === 'OPEN').length}
            </h3>
          </div>
          <p className="text-[10px] text-amber-600 font-semibold mt-2">Awaiting technicians</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[100px]">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Completed Maintenance</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              {isLoading ? '...' : maintenance.filter((m: any) => m.status === 'CLOSED').length}
            </h3>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-2">Assets back in service</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between min-h-[100px]">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Repair Cost</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              INR {isLoading ? '...' : maintenance.reduce((sum: number, m: any) => sum + (m.cost || 0), 0).toLocaleString()}
            </h3>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">Includes parts & labor</p>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 mb-5">
          <Wrench className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-zinc-800">Maintenance Records</h2>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-zinc-400">Loading maintenance records...</div>
          ) : maintenance.map((m: any) => (
            <div
              key={m.id}
              className="p-4 border border-zinc-100 bg-zinc-50/20 rounded-xl flex flex-wrap items-center justify-between gap-4 hover:border-zinc-200 transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-[280px]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-zinc-400">{m.id}</span>
                  <span className="text-sm font-bold text-zinc-800">{m.vehicle?.name || m.vehicleName}</span>
                  <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-medium border border-zinc-200/50">
                    {m.maintenanceType}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed font-medium">{m.description}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Started: {new Date(m.startDate).toLocaleDateString()}
                  </span>
                  {m.endDate && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Completed: {new Date(m.endDate).toLocaleDateString()}
                    </span>
                  )}
                  {m.cost && (
                    <span className="flex items-center gap-0.5 font-bold text-zinc-700">
                      Cost: INR {m.cost}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {getStatusBadge(m.status)}
                
                {m.status === 'OPEN' && (
                  <button
                    onClick={() => {
                      setSelectedMaintId(m.id);
                      setIsResolveModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/10 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    Resolve Order
                  </button>
                )}
              </div>
            </div>
          ))}

          {!isLoading && maintenance.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-400">
              No maintenance tickets registered in database.
            </div>
          )}
          {isLoading && maintenance.length > 0 && null /* To satisfy TS/JSX parsing */}
        </div>
      </div>

      {/* Resolve Maintenance Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 w-full max-w-md p-6 relative">
            <h3 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Resolve Maintenance Order
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-xs text-zinc-500 space-y-1">
                <span className="font-semibold text-zinc-700 block">Ticket ID: {selectedMaintId}</span>
                <p>Resolving this order will release the vehicle asset back into the AVAILABLE status and record the expense.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Repair Cost (INR)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 font-bold text-xs">
                    INR
                  </span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={resolveCost}
                    onChange={(e) => setResolveCost(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Resolve and Release
                </button>
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
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
