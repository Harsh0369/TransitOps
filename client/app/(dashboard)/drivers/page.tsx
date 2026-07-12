"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { drivers, driverMetrics } from "@/lib/mockData";
import { Users, Zap, ShieldCheck, AlertTriangle, UserPlus, Download } from "lucide-react";
import { clsx } from "clsx";

const scoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-amber-500";
  return "text-red-400";
};

const initialsColor = [
  "bg-amber-500 text-black",
  "bg-blue-600 text-white",
  "bg-purple-600 text-white",
  "bg-emerald-600 text-white",
];

export default function DriversPage() {
  const topStats = [
    { label: "Active Drivers", value: driverMetrics.activeDrivers, sub: "+4%", icon: <Users className="w-5 h-5" />, borderColor: "border-l-emerald-500" },
    { label: "On Trip", value: driverMetrics.onTrip, sub: "62% Fleet", icon: <Zap className="w-5 h-5" />, borderColor: "border-l-blue-500" },
    { label: "Avg Safety Score", value: driverMetrics.avgSafetyScore, sub: "A+ Rating", icon: <ShieldCheck className="w-5 h-5" />, borderColor: "border-l-sky-400" },
    { label: "Critical Alerts", value: `0${driverMetrics.criticalAlerts}`, sub: "Action Req.", icon: <AlertTriangle className="w-5 h-5" />, borderColor: "border-l-red-500" },
  ];

  return (
    <RoleGuard allowedRoles={["Dispatcher", "Safety Officer"]}>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Drivers &amp; Safety Profiles</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage fleet personnel, license validity, and safety performance.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all shrink-0">
            <UserPlus className="w-4 h-4" /> Add Driver
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topStats.map((s, i) => (
            <div key={i} className={`bg-zinc-900/40 border border-zinc-800 border-l-4 ${s.borderColor} rounded-lg px-5 py-5 flex justify-between items-start gap-2`}>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{s.label}</p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.sub}</p>
              </div>
              <div className="text-zinc-700">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs + Export */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {["All Drivers", "On Trip", "Off Duty", "Suspended"].map((tab) => (
              <button
                key={tab}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium rounded transition-all",
                  tab === "All Drivers"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Drivers Table */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-900/80 border-b border-zinc-800">
              <tr className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">License No.</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Expiry Date</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4 text-center">Trip %</th>
                <th className="px-5 py-4 text-center">Safety Score</th>
                <th className="px-5 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {drivers.map((d, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", initialsColor[i % initialsColor.length])}>
                        {d.initials}
                      </div>
                      <span className="text-zinc-200 font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-400 text-xs">{d.license}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-semibold rounded">{d.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    {d.expiryWarn ? (
                      <div>
                        <p className="font-mono text-red-400 text-xs font-semibold">{d.expiry}</p>
                        <p className="text-[10px] text-red-400/70 font-bold uppercase tracking-wide">Expiring Soon</p>
                      </div>
                    ) : (
                      <span className="font-mono text-zinc-400 text-xs">{d.expiry}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-400 text-xs">{d.contact}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-semibold text-emerald-400">{d.tripPct}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={clsx("text-lg font-bold", scoreColor(d.safetyScore))}>{d.safetyScore}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="px-5 py-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Showing 4 of 142 drivers</span>
            <div className="flex items-center gap-1">
              {["‹", "1", "2", "3", "›"].map((p, i) => (
                <button key={i} className={clsx("w-7 h-7 rounded flex items-center justify-center transition-colors", p === "1" ? "bg-zinc-700 text-white" : "hover:bg-zinc-800 text-zinc-400")}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Blocking Rules Panel */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-200 mb-1">Automated Trip Blocking Rules</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Rule: Any driver possessing an <span className="text-amber-500 font-semibold">Expired License</span> or currently under <span className="text-amber-500 font-semibold">Suspended Status</span> will be automatically blocked from trip assignments. System override requires Level 4 Dispatch Supervisor clearance.
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
