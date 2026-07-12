'use client';

import React from 'react';
import { useAppContext } from '../providers/AppProvider';
import { Settings, Shield, Mail, Database, Bell } from 'lucide-react';

export const SettingsView = () => {
  const { resetAll } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <h2 className="text-base font-bold text-zinc-800">ERP settings & Configuration</h2>
        <p className="text-xs text-zinc-400">Configure transit policies, notification webhooks, and database defaults</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Policy Configs */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 pb-3 border-b border-zinc-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Safety & Dispatching Policies
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-zinc-700 block">Maximum Operator Speed Limit</span>
                <span className="text-[10px] text-zinc-400">Triggers alerts on exceeding threshold limit</span>
              </div>
              <input
                type="text"
                defaultValue="80 km/h"
                className="w-20 px-3 py-1.5 border border-zinc-200 rounded-lg text-center font-bold text-xs bg-zinc-50 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-zinc-700 block">Fuel Surcharge Standard</span>
                <span className="text-[10px] text-zinc-400">Estimated cost multiplier in ledger calculations</span>
              </div>
              <input
                type="text"
                defaultValue="INR 100 / L"
                className="w-24 px-3 py-1.5 border border-zinc-200 rounded-lg text-center font-bold text-xs bg-zinc-50 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-zinc-700 block">Strict Capacity Verification</span>
                <span className="text-[10px] text-zinc-400">Blocks dispatcher console if payload exceeds capacity</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System & Reset */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 pb-3 border-b border-zinc-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            System Maintenance
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <span className="font-semibold text-zinc-700 block mb-1">Local Database Backup</span>
              <p className="text-[10px] text-zinc-400 mb-2">Restore state values back to baseline hackathon configurations.</p>
              <button
                onClick={() => {
                  if (confirm('Restore demo dataset back to default? All temporary trips/maintenance orders will be overwritten.')) {
                    resetAll();
                    alert('Database state restored.');
                  }
                }}
                className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-indigo-600 hover:text-indigo-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Restore Mock Defaults
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <span className="font-semibold text-zinc-700 block mb-1">Backend Connection URL</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="http://localhost:5000/api"
                  className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 font-mono text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => alert('Prisma database sync is handled via the backend local network.')}
                  className="px-3 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Verify Sync
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
