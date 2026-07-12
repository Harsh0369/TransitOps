'use client';

import React from 'react';
import { useAppContext } from '../providers/AppProvider';
import { TripStatus } from '../types';
import { Route, CheckCircle, Clock, XCircle, Play, Sparkles } from 'lucide-react';

export const TripsView = () => {
  const { trips, vehicles, drivers, dispatchTrip, cancelTrip, completeTrip } = useAppContext();

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
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-zinc-800">Trip Ledger Database</h2>
          <p className="text-xs text-zinc-400">Total recorded dispatches: {trips.length} entries</p>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Trip ID</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Source</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Destination</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Vehicle</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Driver</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Payload Weight</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">ETA</th>
                <th className="py-3 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-sm text-zinc-800">{t.id}</td>
                  <td className="py-4 px-6 text-sm text-zinc-700">{t.source}</td>
                  <td className="py-4 px-6 text-sm text-zinc-700">{t.destination}</td>
                  <td className="py-4 px-6 text-sm text-zinc-600">{t.vehicleName || 'Awaiting'}</td>
                  <td className="py-4 px-6 text-sm text-zinc-600">{t.driverName || 'Awaiting'}</td>
                  <td className="py-4 px-6 text-sm text-zinc-500 font-medium">{t.cargoWeight} kg</td>
                  <td className="py-4 px-6">{getStatusBadge(t.status)}</td>
                  <td className="py-4 px-6 text-xs text-zinc-400 font-medium">{t.eta}</td>
                  <td className="py-4 px-6 text-right text-xs">
                    {t.status === 'DRAFT' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (confirm(`Do you want to dispatch Trip ${t.id}?`)) {
                              dispatchTrip(t.id);
                            }
                          }}
                          className="px-2.5 py-1 font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-lg cursor-pointer"
                        >
                          Dispatch
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter cancellation reason:', 'Awaiting driver');
                            if (reason !== null) {
                              cancelTrip(t.id, reason);
                            }
                          }}
                          className="px-2.5 py-1 font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {t.status === 'DISPATCHED' && (
                      <button
                        onClick={() => {
                          const odom = prompt('Enter final odometer readings:', '46000');
                          const fuel = prompt('Enter fuel used in liters (optional):', '10');
                          if (odom) {
                            const odomNum = parseFloat(odom);
                            const fuelNum = fuel ? parseFloat(fuel) : 0;
                            completeTrip(t.id, odomNum, fuelNum);
                          }
                        }}
                        className="px-2.5 py-1 font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                    {t.status === 'COMPLETED' && (
                      <span className="text-zinc-400 italic">No actions available</span>
                    )}
                    {t.status === 'CANCELLED' && (
                      <span className="text-rose-400 italic">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
