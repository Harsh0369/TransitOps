'use client';

import React from 'react';
import { useAppContext } from '../providers/AppProvider';
import { Search, User, Zap, Bell } from 'lucide-react';

export const Header = () => {
  const { searchQuery, setSearchQuery, activeTab, setActiveTab } = useAppContext();

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20 shadow-sm">
      {/* Search Input */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-zinc-400" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vehicles, drivers, trips..."
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-zinc-50/60 placeholder-zinc-400 transition-all duration-200"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        {/* Quick Dispatcher Button */}
        {activeTab !== 'dispatcher' && (
          <button
            onClick={() => setActiveTab('dispatcher')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Dispatcher Console
          </button>
        )}

        {/* Notifications Icon */}
        <button className="relative p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all duration-150 cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
        </button>

        {/* Profile Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-zinc-800">Manager A</p>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wide">Fleet Controller</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold overflow-hidden shadow-sm">
            <span className="text-sm font-semibold uppercase">MA</span>
          </div>
        </div>
      </div>
    </header>
  );
};
