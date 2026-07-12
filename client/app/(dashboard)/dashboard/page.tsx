"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { recentTrips, vehicleStatusOverview } from "@/lib/mockData";

const metricCards = [
  { label: "Active Vehicles",    value: "53",    borderClass: "border-l-secondary-container" },
  { label: "Available Vehicles", value: "42",    borderClass: "border-l-tertiary" },
  { label: "Maintenance",        value: "05",    borderClass: "border-l-primary-container" },
  { label: "Active Trips",       value: "18",    borderClass: "border-l-secondary" },
  { label: "Pending Trips",      value: "09",    borderClass: "border-l-outline" },
  { label: "Drivers",            value: "26",    borderClass: "border-l-secondary-fixed" },
  { label: "Utilization",        value: "81",    suffix: "%", borderClass: "border-l-tertiary-fixed-dim" },
];

const statusBars = [
  { label: "Available",           count: "42", width: "65%",  barClass: "bg-tertiary" },
  { label: "On Trip",             count: "53", width: "82%",  barClass: "bg-secondary-container" },
  { label: "In Shop (Maintenance)", count: "5", width: "12%", barClass: "bg-primary-container" },
  { label: "Retired / Spare",     count: "2",  width: "5%",   barClass: "bg-error" },
];

const tripStatusStyle: Record<string, string> = {
  "On Trip":    "bg-secondary-container/20 text-secondary",
  "Completed":  "bg-tertiary-container/20 text-tertiary",
  "Dispatched": "bg-secondary/20 text-secondary-fixed",
  "Draft":      "bg-surface-variant/40 text-on-surface-variant",
};

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]}>
      <div className="p-margin_desktop space-y-stack_lg">

        {/* ── Filters & Controls ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: "Vehicle Type", options: ["All Vehicles", "Heavy Duty", "Delivery Van", "Minivan"] },
            { label: "Status",       options: ["All Status", "On Trip", "Maintenance", "Idle"] },
            { label: "Region",       options: ["All Regions", "North", "South", "Coastal"] },
          ].map(({ label, options }) => (
            <div key={label} className="flex flex-col">
              <label className="font-label-caps text-on-surface-variant mb-1">{label}</label>
              <select className="bg-surface-container border border-outline-variant text-on-surface text-body-sm rounded px-3 py-1.5 focus:outline-none focus:ring-2 cursor-pointer">
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button className="mt-auto ml-auto bg-primary text-on-primary font-label-caps px-4 py-2 rounded hover:opacity-90 transition-opacity">
            Dispatch Trip
          </button>
        </div>

        {/* ── Metric Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {metricCards.map(({ label, value, suffix, borderClass }) => (
            <div key={label} className={`metric-card bg-surface-container border border-outline-variant p-4 ${borderClass}`}>
              <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">
                {label}
              </p>
              <div className="flex items-baseline">
                <p className="font-display-lg text-on-surface">{value}</p>
                {suffix && (
                  <span className="text-body-md text-on-surface-variant ml-0.5">{suffix}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Layout: Table + Right Panel ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack_lg">

          {/* Recent Trips Table */}
          <div className="lg:col-span-8 bg-surface-container border border-outline-variant rounded overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h3 className="font-title-sm text-on-surface">Recent Trips</h3>
              <button className="text-primary font-label-caps text-xs hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-lowest text-on-surface-variant">
                  <tr>
                    {["Trip ID", "Vehicle", "Driver", "Status", "ETA"].map((h) => (
                      <th key={h} className="p-4 font-label-caps text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-body-sm divide-y divide-outline-variant">
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-surface-container-highest transition-colors">
                      <td className="p-4 font-data-mono">{trip.id}</td>
                      <td className="p-4">{trip.vehicle}</td>
                      <td className="p-4">{trip.driver}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tripStatusStyle[trip.status] ?? "bg-surface-variant/40 text-on-surface-variant"}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className={`p-4 ${trip.status === "Draft" ? "text-on-surface-variant italic" : "font-data-mono"}`}>
                        {trip.eta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Status Overview + Map */}
          <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded p-4 flex flex-col space-y-stack_lg">
            <h3 className="font-title-sm text-on-surface">Vehicle Status Overview</h3>

            {/* Progress bars */}
            <div className="space-y-stack_lg">
              {statusBars.map(({ label, count, width, barClass }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-label-caps text-on-surface-variant">
                    <span>{label}</span>
                    <span className="text-on-surface">{count} Units</span>
                  </div>
                  <div className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden">
                    <div
                      className={`${barClass} h-full rounded-full transition-all duration-1000`}
                      style={{ width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Fleet Distribution Map */}
            <div className="mt-auto pt-4 border-t border-outline-variant">
              <p className="font-label-caps text-[10px] text-on-surface-variant mb-3">
                CURRENT FLEET DISTRIBUTION
              </p>
              <div className="relative w-full h-40 rounded bg-surface-container-lowest overflow-hidden">
                {/* Map background */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60 grayscale brightness-75"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')" }}
                />
                {/* Vehicle dots */}
                <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-tertiary rounded-full shadow-[0_0_8px_rgba(86,229,169,0.8)] animate-pulse" />
                <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_rgba(173,198,255,0.8)]" />
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-secondary-container rounded-full shadow-[0_0_8px_rgba(5,102,217,0.8)]" />
                {/* GPS badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant pointer-events-none">
                    <span className="text-[10px] font-label-caps text-on-surface">Real-time GPS Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Meta ────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center pt-8 text-[11px] font-label-caps text-on-surface-variant">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-tertiary rounded-full inline-block" />
              System Health: Nominal
            </span>
            <span>Server: US-CENTRAL-01</span>
          </div>
          <div>
            Last Updated: <span className="font-data-mono">2023-10-27 14:42:01 CST</span>
          </div>
        </div>

      </div>

      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center z-50">
        <span className="material-symbols-outlined">add</span>
      </button>
    </RoleGuard>
  );
}
