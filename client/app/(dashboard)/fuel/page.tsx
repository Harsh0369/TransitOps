"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { fuelLogs, otherExpenses } from "@/lib/mockData";
import { useState, useEffect } from "react";
import {
  Fuel, Receipt, TrendingDown, TrendingUp, Plus, ChevronRight,
  Truck, Car, Bus, Calculator
} from "lucide-react";
import { clsx } from "clsx";

export default function FuelExpensesPage() {
  const [totalCost, setTotalCost] = useState(34070);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const noise = Math.floor(Math.random() * 5) - 2; // small fluctuation
      if (Math.abs(noise) > 1) {
        setTotalCost((prev) => prev + noise);
        setIsFading(true);
        const timer = setTimeout(() => setIsFading(false), 300);
        return () => clearTimeout(timer);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RoleGuard allowedRoles={["Financial Analyst"]}>
      <div
        className="p-margin_desktop min-h-[calc(100vh-64px)] overflow-y-auto"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Page Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-stack_lg">
          <div>
            <h2 className="font-display-lg text-display-lg" style={{ color: "var(--color-on-surface)" }}>
              Fuel &amp; Expense Management
            </h2>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
              Monitor and optimize your fleet's operational expenditure.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              className="flex items-center gap-2 px-6 py-3 border text-sm font-bold transition-all hover:bg-surface-container-highest cursor-pointer group"
              style={{
                backgroundColor: "var(--color-surface-container-high)",
                borderColor: "var(--color-outline-variant)",
                color: "var(--color-on-surface)",
              }}
            >
              <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-label-caps uppercase">Add Expense</span>
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold hover:opacity-90 transition-all shadow-lg cursor-pointer group"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
                boxShadow: "0 10px 15px -3px color-mix(in srgb, var(--color-primary) 20%, transparent)",
              }}
            >
              <Fuel className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-label-caps uppercase">Log Fuel</span>
            </button>
          </div>
        </div>

        {/* Analytics Bento Grid */}
        <div className="grid grid-cols-12 gap-gutter mb-gutter">
          {/* Quick Metric 1 */}
          <div
            className="col-span-12 md:col-span-4 lg:col-span-3 p-6 border-l-4 border-t border-r border-b rounded-lg relative overflow-hidden group"
            style={{
              backgroundColor: "var(--color-surface-container)",
              borderColor: "var(--color-outline-variant)",
              borderLeftColor: "var(--color-primary)",
            }}
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Fuel className="w-32 h-32" />
            </div>
            <p className="font-label-caps text-label-caps uppercase tracking-widest" style={{ color: "var(--color-on-surface-variant)" }}>
              Total Fuel Consumption
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg" style={{ color: "var(--color-on-surface)" }}>4,280</span>
              <span className="font-title-sm" style={{ color: "var(--color-on-surface-variant)" }}>L</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-tertiary">
              <TrendingDown className="w-4 h-4" />
              <span className="font-label-caps text-xs">2.4% vs last month</span>
            </div>
          </div>

          {/* Quick Metric 2 */}
          <div
            className="col-span-12 md:col-span-4 lg:col-span-3 p-6 border-l-4 border-t border-r border-b rounded-lg relative overflow-hidden group"
            style={{
              backgroundColor: "var(--color-surface-container)",
              borderColor: "var(--color-outline-variant)",
              borderLeftColor: "var(--color-secondary)",
            }}
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Receipt className="w-32 h-32" />
            </div>
            <p className="font-label-caps text-label-caps uppercase tracking-widest" style={{ color: "var(--color-on-surface-variant)" }}>
              Avg. Cost Per Mile
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg" style={{ color: "var(--color-on-surface)" }}>$1.42</span>
            </div>
            <div className="mt-2 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
              <TrendingUp className="w-4 h-4" />
              <span className="font-label-caps text-xs">0.8% due to toll hikes</span>
            </div>
          </div>

          {/* Quick Metric 3 */}
          <div
            className="col-span-12 md:col-span-4 lg:col-span-6 p-6 border rounded-lg overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--color-surface-container)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            <div className="space-y-4">
              <p className="font-label-caps text-label-caps uppercase tracking-widest" style={{ color: "var(--color-on-surface-variant)" }}>
                Expense Distribution
              </p>
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="font-label-caps text-[10px]" style={{ color: "var(--color-primary)" }}>FUEL</span>
                  <span className="font-data-mono text-xl" style={{ color: "var(--color-on-surface)" }}>62%</span>
                </div>
                <div className="w-px h-10" style={{ backgroundColor: "var(--color-outline-variant)" }} />
                <div className="flex flex-col">
                  <span className="font-label-caps text-[10px]" style={{ color: "var(--color-tertiary)" }}>MAINT.</span>
                  <span className="font-data-mono text-xl" style={{ color: "var(--color-on-surface)" }}>24%</span>
                </div>
                <div className="w-px h-10" style={{ backgroundColor: "var(--color-outline-variant)" }} />
                <div className="flex flex-col">
                  <span className="font-label-caps text-[10px]" style={{ color: "var(--color-secondary)" }}>TOLLS</span>
                  <span className="font-data-mono text-xl" style={{ color: "var(--color-on-surface)" }}>14%</span>
                </div>
              </div>
            </div>
            <div
              className="w-full sm:w-48 h-12 relative rounded-lg overflow-hidden border"
              style={{
                backgroundColor: "var(--color-surface-container-low)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              {/* Sparkline */}
              <div className="absolute inset-0 flex items-end">
                <div className="w-full h-full bg-gradient-to-t from-primary/10 to-transparent" />
                <svg className="w-full h-full stroke-primary fill-none stroke-[2]" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0 35 Q 10 30, 20 32 T 40 10 T 60 25 T 80 5 T 100 15" style={{ stroke: "var(--color-primary)" }} />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="space-y-gutter mb-gutter">
          {/* Fuel Logs Table */}
          <section
            className="border rounded-lg overflow-hidden"
            style={{
              backgroundColor: "var(--color-surface-container)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--color-outline-variant)" }}
            >
              <h3 className="font-title-sm text-title-sm flex items-center gap-2" style={{ color: "var(--color-on-surface)" }}>
                <Fuel className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                Fuel Logs
              </h3>
              <button
                className="transition-colors flex items-center gap-1 font-label-caps text-xs cursor-pointer"
                style={{ color: "var(--color-on-surface-variant)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-on-surface-variant)"}
              >
                VIEW ALL LOGS <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "var(--color-surface-container-low)" }}>
                    <th className="px-6 py-3 font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>VEHICLE</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>DATE</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>LITERS</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-right" style={{ color: "var(--color-on-surface-variant)" }}>FUEL COST</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-outline-variant)" }}>
                  {fuelLogs.map((log, i) => {
                    const isTruck = log.type === "Truck";
                    return (
                      <tr
                        key={i}
                        className="transition-colors border-b"
                        style={{ borderColor: "var(--color-outline-variant)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-container-high)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isTruck ? (
                              <Truck className="w-5 h-5" style={{ color: "var(--color-on-surface-variant)" }} />
                            ) : (
                              <Car className="w-5 h-5" style={{ color: "var(--color-on-surface-variant)" }} />
                            )}
                            <span className="font-data-mono uppercase tracking-tighter" style={{ color: "var(--color-on-surface)" }}>
                              {log.vehicle}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-body-sm" style={{ color: "var(--color-on-surface-variant)" }}>{log.date}</td>
                        <td className="px-6 py-4">
                          <span className="font-data-mono" style={{ color: "var(--color-on-surface)" }}>
                            {log.liters} <span style={{ color: "var(--color-on-surface-variant)" }}>L</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-data-mono" style={{ color: "var(--color-primary)" }}>
                            ${log.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Other Expenses Table */}
          <section
            className="border rounded-lg overflow-hidden"
            style={{
              backgroundColor: "var(--color-surface-container)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--color-outline-variant)" }}
            >
              <h3 className="font-title-sm text-title-sm flex items-center gap-2" style={{ color: "var(--color-on-surface)" }}>
                <Receipt className="w-5 h-5" style={{ color: "var(--color-secondary)" }} />
                Other Expenses (Toll / Misc)
              </h3>
              <div className="flex gap-2">
                {["EXPORT PDF", "CSV"].map((btn) => (
                  <button
                    key={btn}
                    className="px-3 py-1 border rounded font-label-caps text-[10px] transition-colors cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-surface-container-low)",
                      borderColor: "var(--color-outline-variant)",
                      color: "var(--color-on-surface-variant)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-on-surface)";
                      e.currentTarget.style.borderColor = "var(--color-outline)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-on-surface-variant)";
                      e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                    }}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "var(--color-surface-container-low)" }}>
                    <th className="px-6 py-3 font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>TRIP ID</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>VEHICLE</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-right" style={{ color: "var(--color-on-surface-variant)" }}>TOLL</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-right" style={{ color: "var(--color-on-surface-variant)" }}>OTHER</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-right" style={{ color: "var(--color-on-surface-variant)" }}>MAINT. (LINKED)</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-right" style={{ color: "var(--color-on-surface-variant)" }}>STATUS</th>
                    <th className="px-6 py-3 font-label-caps text-label-caps text-right" style={{ color: "var(--color-on-surface-variant)" }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-outline-variant)" }}>
                  {otherExpenses.map((exp, i) => {
                    const total = exp.toll + exp.other + exp.maint;
                    const isAvailable = exp.status === "Available";
                    return (
                      <tr
                        key={i}
                        className="transition-colors border-b"
                        style={{ borderColor: "var(--color-outline-variant)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-container-high)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td className="px-6 py-4">
                          <span
                            className="font-data-mono underline cursor-pointer decoration-secondary/30 underline-offset-4 hover:text-primary transition-colors"
                            style={{ color: "var(--color-secondary)" }}
                          >
                            {exp.tripId}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-data-mono" style={{ color: "var(--color-on-surface)" }}>{exp.vehicle}</td>
                        <td className="px-6 py-4 text-right font-data-mono" style={{ color: "var(--color-on-surface-variant)" }}>
                          ${exp.toll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-data-mono" style={{ color: "var(--color-on-surface-variant)" }}>
                          ${exp.other.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-data-mono" style={{ color: "var(--color-on-surface-variant)" }}>
                          ${exp.maint.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={clsx(
                              "px-2.5 py-0.5 rounded-full font-label-caps text-[10px] border",
                              isAvailable
                                ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                                : "bg-secondary-container/20 text-on-secondary-container border-secondary-container/40"
                            )}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-data-mono font-bold" style={{ color: "var(--color-on-surface)" }}>
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Operational Summary Bar */}
        <div
          className="p-8 flex flex-col md:flex-row md:items-center justify-between rounded-xl border gap-6"
          style={{
            backgroundColor: "var(--color-surface-container-highest)",
            borderColor: "color-mix(in srgb, var(--color-primary) 30%, transparent)",
          }}
        >
          <div className="flex items-center gap-6">
            <div
              className="w-14 h-14 flex items-center justify-center rounded-lg border shrink-0"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              }}
            >
              <Calculator className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="font-label-caps text-label-caps tracking-[0.2em] uppercase" style={{ color: "var(--color-primary)" }}>
                Total Operational Cost (Auto)
              </p>
              <p className="font-body-sm text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                Sum of all Fuel Logs + Maintenance Linkage
              </p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="flex items-baseline gap-1 md:justify-end">
              <span className="font-label-caps text-xl" style={{ color: "var(--color-primary)" }}>$</span>
              <span
                className={clsx(
                  "font-display-lg text-6xl tracking-tighter transition-all duration-300",
                  isFading ? "opacity-70 scale-[0.99]" : "opacity-100"
                )}
                style={{ color: "var(--color-primary)" }}
              >
                {Math.floor(totalCost).toLocaleString()}
              </span>
              <span className="font-data-mono text-2xl" style={{ color: "color-mix(in srgb, var(--color-primary) 60%, transparent)" }}>
                .00
              </span>
            </div>
            <p className="font-label-caps text-[10px] mt-2" style={{ color: "var(--color-on-surface-variant)" }}>
              LAST UPDATED: JUST NOW
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
