'use client';

import React from 'react';
import { useAppContext } from '../providers/AppProvider';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  RefreshCw,
  Zap,
  ScrollText
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, resetAll } = useAppContext();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'dispatcher', name: 'Trip Dispatcher', icon: Zap, highlight: true },
    { id: 'fleet', name: 'Fleet', icon: Truck },
    { id: 'drivers', name: 'Drivers', icon: Users },
    { id: 'trips', name: 'Trips', icon: Route },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
    { id: 'expenses', name: 'Fuel & Expenses', icon: Fuel },
    { id: 'analytics', name: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit-logs', name: 'Audit Logs', icon: ScrollText },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800 bg-zinc-950">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
          <Route className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">TransitOps</h1>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Enterprise ERP</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                isActive
                  ? item.highlight
                    ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20'
                    : 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/25'
                  : 'hover:bg-zinc-800/60 hover:text-white text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? '' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} />
                <span>{item.name}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Reset Action */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all dashboard state to mock defaults?')) {
              resetAll();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo Database
        </button>
        <div className="mt-3 text-center">
          <span className="text-[10px] text-zinc-600">v1.2.0-beta • TransitOps Hackathon</span>
        </div>
      </div>
    </aside>
  );
};
