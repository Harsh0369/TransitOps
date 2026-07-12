"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useMaintenance, useCreateMaintenance, useVehicles } from "@/hooks/queries";
import { LoadingSpinner, ErrorState } from "@/components/ui/DataStates";
import {
  ChevronRight, FilePlus2, Save, Wrench, Wallet, Clock, MoreVertical, Info, Loader
} from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

export default function MaintenancePage() {
  const { data: maintenance = [], isLoading, error } = useMaintenance();
  const { data: vehicles = [] } = useVehicles();
  const createMaintenance = useCreateMaintenance();
  
  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "Oil Change",
    cost: "",
    date: new Date().toISOString().split('T')[0],
    status: "Active"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createMaintenance.mutateAsync(formData);
      setFormData({ vehicleId: "", serviceType: "Oil Change", cost: "", date: new Date().toISOString().split('T')[0], status: "Active" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const activeMaintenance = maintenance.filter((m: any) => m.status === "Active").length;
  const monthExpenditure = maintenance
    .filter((m: any) => {
      const mDate = new Date(m.date);
      const now = new Date();
      return mDate.getMonth() === now.getMonth() && mDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, m: any) => sum + (parseInt(m.cost) || 0), 0);
  const avgTurnaround = maintenance.length > 0 ? Math.round(Math.random() * 10) : 0; // Placeholder

  return (
    <RoleGuard allowedRoles={["Fleet Manager"]}>
      <div
        className="p-margin_desktop min-h-[calc(100vh-64px)] overflow-y-auto"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Page Header */}
        <div className="mb-stack_lg">
          <h2 className="font-display-lg mb-2" style={{ color: "var(--color-on-surface)" }}>
            Vehicle Maintenance
          </h2>
          <nav className="flex items-center gap-2 font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
            <span className="hover:text-primary cursor-pointer transition-colors">Fleet Management</span>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: "var(--color-primary)" }}>Maintenance & Service Logs</span>
          </nav>
        </div>

        <div className="grid grid-cols-12 gap-stack_lg">
          {/* ── LEFT: Log Service Record Form ───────────────────────────── */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-stack_lg">
            <div
              className="p-6 border rounded-lg relative overflow-hidden"
              style={{
                backgroundColor: "var(--color-surface-container)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: "var(--color-primary-container)" }} />
              <h3 className="font-label-caps text-label-caps mb-6 flex items-center gap-2" style={{ color: "var(--color-primary-container)" }}>
                <FilePlus2 className="w-4 h-4" />
                LOG SERVICE RECORD
              </h3>

              <form className="space-y-stack_md" onSubmit={handleSubmit}>
                <div>
                  <label className="block font-label-caps text-label-caps mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    VEHICLE
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-surface-container-low)",
                      borderColor: "var(--color-outline-variant)",
                      color: "var(--color-on-surface)",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-primary-container)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-outline-variant)"}
                  >
                    <option value="">Select a vehicle...</option>
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    SERVICE TYPE
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-surface-container-low)",
                      borderColor: "var(--color-outline-variant)",
                      color: "var(--color-on-surface)",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-primary-container)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-outline-variant)"}
                  >
                    <option>Oil Change</option>
                    <option>Engine Repair</option>
                    <option>Tyre Replace</option>
                    <option>Brake Inspection</option>
                    <option>Routine Maintenance</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-stack_md">
                  <div>
                    <label className="block font-label-caps text-label-caps mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                      COST (USD)
                    </label>
                    <input
                      type="text"
                      placeholder="2500"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      disabled={isSubmitting}
                      className="w-full border rounded px-3 py-2 text-sm font-data-mono focus:outline-none transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--color-surface-container-low)",
                        borderColor: "var(--color-outline-variant)",
                        color: "var(--color-on-surface)",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-primary-container)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-outline-variant)"}
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                      DATE
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      disabled={isSubmitting}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--color-surface-container-low)",
                        borderColor: "var(--color-outline-variant)",
                        color: "var(--color-on-surface)",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-primary-container)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-outline-variant)"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-caps text-label-caps mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    STATUS
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === "Active"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-low border-outline-variant disabled:opacity-50"
                      />
                      <span className="text-sm transition-colors group-hover:text-primary" style={{ color: "var(--color-on-surface)" }}>Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value="Closed"
                        checked={formData.status === "Closed"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-low border-outline-variant disabled:opacity-50"
                      />
                      <span className="text-sm transition-colors group-hover:text-primary" style={{ color: "var(--color-on-surface)" }}>Closed</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 mt-4 shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-primary-container)",
                    color: "var(--color-on-primary-container)",
                    boxShadow: "0 10px 15px -3px color-mix(in srgb, var(--color-primary-container) 10%, transparent)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      SAVE RECORD
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Operational Logic */}
            <div
              className="p-6 border rounded-lg"
              style={{
                backgroundColor: "var(--color-surface-container)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h3 className="font-label-caps text-label-caps mb-6 uppercase tracking-wider" style={{ color: "var(--color-on-surface)" }}>
                Operational Logic
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="font-bold flex items-center gap-1" style={{ color: "var(--color-tertiary)" }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-tertiary)" }} />
                      Available
                    </span>
                    <span className="text-[10px] uppercase mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Status Shift</span>
                  </div>
                  <div className="flex-1 flex items-center px-4">
                    <div className="h-px flex-1 relative" style={{ backgroundColor: "var(--color-outline-variant)" }}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] italic whitespace-nowrap" style={{ color: "var(--color-on-surface-variant)" }}>
                        creating active record
                      </div>
                      <ChevronRight className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-outline-variant)" }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold flex items-center gap-1" style={{ color: "var(--color-primary-container)" }}>
                      In Shop
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-primary-container)" }} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="font-bold flex items-center gap-1" style={{ color: "var(--color-primary-container)" }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-primary-container)" }} />
                      In Shop
                    </span>
                  </div>
                  <div className="flex-1 flex items-center px-4">
                    <div className="h-px flex-1 relative" style={{ backgroundColor: "var(--color-outline-variant)" }}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] italic whitespace-nowrap" style={{ color: "var(--color-on-surface-variant)" }}>
                        closing record (set retired)
                      </div>
                      <ChevronRight className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-outline-variant)" }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold flex items-center gap-1" style={{ color: "var(--color-tertiary)" }}>
                      Available
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-tertiary)" }} />
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="mt-6 p-4 rounded border-l-4 flex gap-3"
                style={{
                  backgroundColor: "var(--color-surface-container-low)",
                  borderColor: "var(--color-primary-container)",
                }}
              >
                <Info className="w-5 h-5 shrink-0" style={{ color: "var(--color-primary-container)" }} />
                <p className="text-xs italic leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  <strong style={{ color: "var(--color-on-surface)" }}>Note:</strong> In Shop vehicles are automatically removed from the dispatch pool and listed as "Restricted" in the dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* ── RIGHT: Service Log Table ────────────────────────────────── */}
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-stack_lg">
            {/* Statistics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-stack_md">
              <div
                className="p-4 border rounded flex items-center gap-4"
                style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)", color: "var(--color-primary)" }}
                >
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>Active Maintenance</p>
                  <p className="text-[28px] font-bold leading-[34px] font-display-lg" style={{ color: "var(--color-on-surface)" }}>
                    {activeMaintenance} <span className="text-sm font-normal" style={{ color: "var(--color-on-surface-variant)" }}>Units</span>
                  </p>
                </div>
              </div>

              <div
                className="p-4 border rounded flex items-center gap-4"
                style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-tertiary) 10%, transparent)", color: "var(--color-tertiary)" }}
                >
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>Month Expenditure</p>
                  <p className="text-[28px] font-bold leading-[34px] font-display-lg" style={{ color: "var(--color-on-surface)" }}>
                    ${monthExpenditure}
                  </p>
                </div>
              </div>

              <div
                className="p-4 border rounded flex items-center gap-4"
                style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-secondary) 10%, transparent)", color: "var(--color-secondary)" }}
                >
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>Avg. Turnaround</p>
                  <p className="text-[28px] font-bold leading-[34px] font-display-lg" style={{ color: "var(--color-on-surface)" }}>
                    {avgTurnaround} <span className="text-sm font-normal" style={{ color: "var(--color-on-surface-variant)" }}>Days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div
              className="border rounded flex flex-col flex-1 overflow-hidden"
              style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ backgroundColor: "var(--color-surface-container-high)", borderColor: "var(--color-outline-variant)" }}
              >
                <h3 className="font-label-caps text-label-caps uppercase tracking-widest" style={{ color: "var(--color-on-surface)" }}>
                  Recent Service Log
                </h3>
                <div className="flex items-center gap-2">
                  {["FILTER", "EXPORT PDF"].map((btn) => (
                    <button
                      key={btn}
                      className="px-3 py-1 border rounded text-[11px] font-bold transition-all"
                      style={{
                        backgroundColor: "var(--color-surface-container-low)",
                        borderColor: "var(--color-outline-variant)",
                        color: "var(--color-on-surface-variant)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--color-primary)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--color-outline-variant)"}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                {isLoading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <div className="p-6">
                    <ErrorState error={error as Error} />
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--color-surface-container-high)" }}>
                      <tr>
                        {["VEHICLE", "SERVICE TYPE", "DATE", "COST (USD)", "STATUS"].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 font-label-caps text-label-caps font-bold border-b"
                            style={{ color: "var(--color-on-surface-variant)", borderColor: "var(--color-outline-variant)" }}
                          >
                            {h}
                          </th>
                        ))}
                        <th
                          className="px-6 py-4 font-label-caps text-label-caps font-bold border-b text-right"
                          style={{ color: "var(--color-on-surface-variant)", borderColor: "var(--color-outline-variant)" }}
                        >
                          ACTION
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--color-outline-variant)" }}>
                      {maintenance.map((log: any, i: number) => {
                        const isInShop = log.status === "In Shop";
                      return (
                        <tr
                          key={i}
                          className="transition-colors group border-b"
                          style={{ borderColor: "var(--color-outline-variant)" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-container-low)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: "var(--color-surface-container-highest)",
                                  color: log.type === "Van" ? "var(--color-primary)" : "var(--color-secondary)"
                                }}
                              >
                                <Wrench className="w-4 h-4" />
                              </div>
                              <span className="font-data-mono" style={{ color: "var(--color-on-surface)" }}>
                                {log.vehicle}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5" style={{ color: "var(--color-on-surface)" }}>
                            {log.service}
                          </td>
                          <td className="px-6 py-5 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                            {log.date}
                          </td>
                          <td className="px-6 py-5 font-data-mono" style={{ color: "var(--color-on-surface)" }}>
                            {log.cost}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold border uppercase"
                              style={{
                                backgroundColor: isInShop
                                  ? "color-mix(in srgb, var(--color-primary-container) 15%, transparent)"
                                  : "color-mix(in srgb, var(--color-tertiary) 15%, transparent)",
                                color: isInShop ? "var(--color-primary-container)" : "var(--color-tertiary)",
                                borderColor: isInShop
                                  ? "color-mix(in srgb, var(--color-primary-container) 30%, transparent)"
                                  : "color-mix(in srgb, var(--color-tertiary) 30%, transparent)",
                              }}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              className="p-1 rounded-full transition-colors"
                              style={{ color: "var(--color-on-surface-variant)" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--color-primary)";
                                e.currentTarget.style.backgroundColor = "var(--color-surface-container-highest)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--color-on-surface-variant)";
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </RoleGuard>
  );
}
