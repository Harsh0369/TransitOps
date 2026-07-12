"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { vehicles, fleetSummaryStats } from "@/lib/mockData";
import { useState } from "react";
import { Search, SlidersHorizontal, Plus, ChevronDown } from "lucide-react";

const vehicleStatusColor: Record<string, string> = {
  "Available": "text-emerald-400",
  "On Trip": "text-blue-400",
  "In Shop": "text-amber-500",
  "Retired": "text-red-400",
};

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const filtered = vehicles.filter((v) => {
    const matchSearch = v.regNo.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All Types" || v.type === typeFilter;
    const matchStatus = statusFilter === "All Statuses" || v.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <RoleGuard allowedRoles={["FLEET_MANAGER", "DRIVER"]}>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Vehicle Registry</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage and monitor your fleet&apos;s operational health and status.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all shrink-0">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Vehicle Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300 px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {["All Types", "Van", "Truck", "Mini"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Operational Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300 px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {["All Statuses", "Available", "On Trip", "In Shop", "Retired"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Registration Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search registration no..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 self-end">
            <button className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs font-semibold text-zinc-300 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> ADVANCED
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-4">Reg. No. (Unique)</th>
                <th className="px-5 py-4">Name / Model</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Capacity</th>
                <th className="px-5 py-4 text-right">Odometer (km)</th>
                <th className="px-5 py-4 text-right">Acq. Cost (₹)</th>
                <th className="px-5 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((v, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-5 py-4 font-mono text-amber-500 group-hover:text-amber-400 text-xs font-semibold cursor-pointer">{v.regNo}</td>
                  <td className="px-5 py-4 text-zinc-200">{v.name}</td>
                  <td className="px-5 py-4 text-zinc-400">{v.type}</td>
                  <td className="px-5 py-4 text-zinc-400">{v.capacity}</td>
                  <td className="px-5 py-4 text-right text-zinc-300 font-mono">{v.odometer}</td>
                  <td className="px-5 py-4 text-right text-zinc-300 font-mono">{v.acqCost}</td>
                  <td className="px-5 py-4 text-right">
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500 text-sm">No vehicles match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info Banner */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg px-5 py-4 flex flex-wrap items-start gap-6 text-xs text-zinc-400">
          <p>
            <span className="text-amber-500 font-semibold">ⓘ Rule:</span> Registration No. must be unique for all fleet assets.
          </p>
          <p>
            Vehicles with <span className="text-red-400 font-semibold">Retired</span> or <span className="text-amber-500 font-semibold">In Shop</span> status are automatically hidden from the active Trip Dispatcher view to prevent booking errors.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fleetSummaryStats.map((s, i) => (
            <div key={i} className={`bg-zinc-900/40 border border-zinc-800 border-l-4 ${s.borderColor} rounded-lg px-5 py-5`}>
              <p className="text-xs font-semibold text-zinc-400 mb-2">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{s.value}</span>
                <span className="text-sm text-zinc-500">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
