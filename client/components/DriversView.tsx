'use client';

import React from 'react';
import { useAppContext } from '../providers/AppProvider';
import { Users, Phone, Award, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { DriverStatus } from '../types';

export const DriversView = () => {
  const { drivers } = useAppContext();

  const getStatusBadge = (status: DriverStatus) => {
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            On Duty
          </span>
        );
      case 'OFF_DUTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Clock className="w-3 h-3" />
            Off Duty
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <ShieldAlert className="w-3 h-3" />
            Suspended
          </span>
        );
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 80) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getSafetyBarColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-indigo-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <h2 className="text-base font-bold text-zinc-800">Operator Directory</h2>
        <p className="text-xs text-zinc-400">Total registered operators: {drivers.length} drivers</p>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((drv) => (
          <div key={drv.id} className="bg-white border border-zinc-100 hover:border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between group hover:shadow-md transition-all duration-200">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 shadow-sm group-hover:scale-105 transition-transform">
                    {drv.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800">{drv.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-medium tracking-wide">License: {drv.licenseCategory} ({drv.licenseNumber})</p>
                  </div>
                </div>
                {getStatusBadge(drv.status)}
              </div>

              {/* Safety progress bar */}
              <div className="space-y-1.5 p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/60">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    Safety Score
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getSafetyScoreColor(drv.safetyScore)}`}>
                    {drv.safetyScore}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200/60 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getSafetyBarColor(drv.safetyScore)}`}
                    style={{ width: `${drv.safetyScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                {drv.contactNumber}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">Expires: {drv.licenseExpiry}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
