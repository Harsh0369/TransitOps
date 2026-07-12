"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, Bell, Search } from "lucide-react";

export function TopNavbar() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <header className="h-16 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center w-96 relative">
        <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search everywhere..." 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#09090b]" />
        </button>

        <div className="h-8 w-px bg-zinc-800 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
            <p className="text-xs text-amber-500 leading-tight">{user.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
            {user.name.charAt(0)}
          </div>
          
          <button 
            onClick={logout}
            className="ml-2 p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-900"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
