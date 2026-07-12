"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { analyticsKpis, monthlyRevenue, costliestVehicles, recentAlerts } from "@/lib/mockData";
import { Fuel, Gauge, DollarSign, TrendingUp, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const kpiIcons: Record<string, React.ReactNode> = {
  Fuel: <Fuel className="w-8 h-8 text-zinc-700" />,
  Gauge: <Gauge className="w-8 h-8 text-zinc-700" />,
  DollarSign: <DollarSign className="w-8 h-8 text-zinc-700" />,
  TrendingUp: <TrendingUp className="w-8 h-8 text-zinc-700" />,
};

const kpiBorder = ["border-l-emerald-500", "border-l-amber-500", "border-l-blue-500", "border-l-purple-500"];

export default function AnalyticsPage() {
  const [revenueRange, setRevenueRange] = useState<"6" | "12">("6");
  const chartData = revenueRange === "6" ? monthlyRevenue.slice(-6) : monthlyRevenue;

  return (
    <RoleGuard allowedRoles={["FLEET_MANAGER", "FINANCIAL_ANALYST"]}>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Operations Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time performance metrics and cost analysis across the active fleet.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {analyticsKpis.map((kpi, i) => (
            <div
              key={i}
              className={clsx(
                "bg-zinc-900/40 border border-zinc-800 border-l-4 rounded-lg px-5 py-5 flex justify-between items-center gap-3",
                kpiBorder[i]
              )}
            >
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-zinc-400 mt-1">{kpi.unit}</p>
              </div>
              <div className="shrink-0">{kpiIcons[kpi.icon]}</div>
            </div>
          ))}
        </div>

        {/* Middle Row: Bar Chart + Costliest Vehicles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-zinc-200">Monthly Revenue</h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost</p>
              </div>
              <div className="flex gap-1">
                {(["6", "12"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRevenueRange(r)}
                    className={clsx(
                      "px-3 py-1.5 text-xs font-semibold rounded transition-all",
                      revenueRange === r ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    {r} MONTHS
                  </button>
                ))}
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#52525b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#e4e4e7", fontSize: 12 }}
                    formatter={(val) => [`$${Number(val ?? 0).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Costliest Vehicles */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-zinc-200">Top Costliest Vehicles</h2>

            <div className="flex flex-col gap-5">
              {costliestVehicles.map((v, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">{v.name}</span>
                    <span className="text-xs font-bold text-blue-400">${v.cost.toLocaleString()}</span>
                  </div>
                  <ProgressBar progress={(v.cost / v.maxCost) * 100} colorClass={v.color} />
                  <p className="text-[11px] text-zinc-500">{v.note}</p>
                </div>
              ))}
            </div>

            <button className="mt-auto w-full py-2.5 border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800 rounded transition-colors uppercase tracking-widest">
              View Full Audit Trail
            </button>
          </div>
        </div>

        {/* Recent Alerts & Actions */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Alerts &amp; Actions</h2>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/20 transition-colors">
                <div className={clsx(
                  "mt-0.5 w-2 h-2 rounded-full shrink-0",
                  alert.level === "critical" ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                )} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-200">{alert.message}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{alert.sub}</p>
                </div>
                <span className="text-xs font-mono text-zinc-500 shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
