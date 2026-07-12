"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { liveTrips, availableVehiclesForTrip, availableDriversForTrip } from "@/lib/mockData";
import { useState } from "react";
import {
  Truck, Clock, MoreVertical, Check, AlertTriangle, X,
  Zap, PlusCircle, Plus, ArrowRight, Hourglass, UserX, Info
} from "lucide-react";
import { clsx } from "clsx";

const VEHICLE_CAPACITY: Record<string, number> = {
  "van-05": 500,
  "truck-12": 2500,
  "bike-02": 50,
};

const TRIP_STEPS = ["Draft", "Dispatched", "Completed", "Cancelled"];

export default function TripsPage() {
  const [source, setSource] = useState("Gandhinagar Depot");
  const [destination, setDestination] = useState("Ahmedabad Hub");
  const [vehicleId, setVehicleId] = useState("van-05");
  const [driverId, setDriverId] = useState("alex");
  const [cargoWeight, setCargoWeight] = useState(700);
  const [distance, setDistance] = useState(38);

  const capacity = VEHICLE_CAPACITY[vehicleId] ?? 500;
  const overCapacity = cargoWeight > capacity;

  return (
    <RoleGuard allowedRoles={["Dispatcher"]}>
      <div
        className="p-margin_desktop min-h-[calc(100vh-64px)] overflow-y-auto"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="grid grid-cols-12 gap-stack_lg">

          {/* ── LEFT: Create Trip Form ─────────────────────────────────── */}
          <section className="col-span-12 lg:col-span-5 space-y-stack_lg">
            <div
              className="p-stack_lg border rounded-lg"
              style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}
            >
              {/* Form header */}
              <div className="flex items-center justify-between mb-stack_lg">
                <h2 className="font-headline-md" style={{ color: "var(--color-on-surface)" }}>
                  Create Trip
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-tertiary)" }} />
                  <span className="font-label-caps text-label-caps" style={{ color: "var(--color-tertiary)" }}>
                    New Draft
                  </span>
                </div>
              </div>

              {/* Lifecycle Progress */}
              <div className="flex items-center justify-between mb-stack_lg px-4 relative">
                <div
                  className="absolute top-3 left-[12%] right-[12%] h-px -z-10"
                  style={{ backgroundColor: "var(--color-outline-variant)" }}
                />
                {TRIP_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center border-2"
                      style={
                        i === 0
                          ? { backgroundColor: "var(--color-tertiary)", borderColor: "var(--color-surface-container)" }
                          : { backgroundColor: "var(--color-surface-container-high)", borderColor: "var(--color-outline-variant)" }
                      }
                    >
                      {i === 0 && <Check className="w-3 h-3" style={{ color: "var(--color-on-tertiary)" }} strokeWidth={3} />}
                    </div>
                    <span
                      className="font-label-caps text-[10px]"
                      style={{ color: i === 0 ? "var(--color-tertiary)" : "var(--color-on-surface-variant)" }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Form fields */}
              <div className="space-y-stack_md">
                <div className="grid grid-cols-2 gap-stack_md">
                  {[
                    { label: "Source", value: source, onChange: setSource },
                    { label: "Destination", value: destination, onChange: setDestination },
                  ].map(({ label, value, onChange }) => (
                    <div key={label} className="space-y-1">
                      <label className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none"
                        style={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: "var(--color-outline-variant)",
                          color: "var(--color-on-surface)",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-outline-variant)"; }}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                    Vehicle (Available Only)
                  </label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-outline-variant)",
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {availableVehiclesForTrip.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                    Driver (Available Only)
                  </label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-outline-variant)",
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {availableDriversForTrip.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-stack_md">
                  <div className="space-y-1">
                    <label className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                      Cargo Weight (KG)
                    </label>
                    <input
                      type="number"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(Number(e.target.value))}
                      className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none font-bold"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: overCapacity ? "var(--color-error)" : "var(--color-outline-variant)",
                        color: overCapacity ? "var(--color-error)" : "var(--color-on-surface)",
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                      Planned Distance (KM)
                    </label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-outline-variant)",
                        color: "var(--color-on-surface)",
                      }}
                    />
                  </div>
                </div>

                {/* Capacity Warning */}
                {overCapacity && (
                  <div
                    className="border rounded-lg p-stack_md flex items-start gap-3"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-error-container) 20%, transparent)",
                      borderColor: "color-mix(in srgb, var(--color-error) 30%, transparent)",
                    }}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-error)" }} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold" style={{ color: "var(--color-error)" }}>
                        Vehicle Capacity: {capacity} kg
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                        Cargo Weight: {cargoWeight} kg
                      </p>
                      <p className="text-sm flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                        <X className="w-4 h-4" />
                        Capacity exceeded by {cargoWeight - capacity} kg — dispatch blocked
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-stack_md flex gap-3">
                  <button
                    disabled={overCapacity}
                    className={clsx(
                      "flex-1 py-3 rounded-lg font-label-caps text-label-caps flex items-center justify-center gap-2 transition-all",
                      overCapacity ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
                    )}
                    style={
                      overCapacity
                        ? { backgroundColor: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" }
                        : { backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }
                    }
                  >
                    <Zap className="w-4 h-4" />
                    {overCapacity ? "Dispatch Disabled" : "Dispatch Trip"}
                  </button>
                  <button
                    className="px-stack_lg py-3 rounded-lg font-label-caps text-label-caps transition-all hover:opacity-90"
                    style={{
                      backgroundColor: "var(--color-surface-variant)",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Helper tip */}
            <div
              className="p-stack_md border rounded-lg"
              style={{
                backgroundColor: "var(--color-surface-container-low)",
                borderColor: "color-mix(in srgb, var(--color-outline-variant) 50%, transparent)",
              }}
            >
              <p className="text-sm italic" style={{ color: "var(--color-on-surface-variant)" }}>
                On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
              </p>
            </div>
          </section>

          {/* ── RIGHT: Live Board ──────────────────────────────────────── */}
          <section className="col-span-12 lg:col-span-7">
            <div className="flex items-center justify-between mb-stack_lg">
              <h2 className="font-headline-md" style={{ color: "var(--color-on-surface)" }}>Live Board</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Live updates:</span>
                <div className="flex gap-1">
                  {[0, 75, 150].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                      style={{ backgroundColor: "var(--color-tertiary)", animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-stack_md">
              {/* TR001 — Dispatched */}
              <div
                className="border rounded-lg p-stack_lg relative overflow-hidden transition-all hover:border-secondary group"
                style={{
                  backgroundColor: "var(--color-surface-container-high)",
                  borderColor: "color-mix(in srgb, var(--color-secondary) 30%, transparent)",
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--color-secondary)" }} />
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-data-mono text-sm" style={{ color: "var(--color-secondary)" }}>TR001</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--color-secondary) 15%, transparent)",
                          color: "var(--color-secondary)",
                        }}
                      >Dispatched</span>
                    </div>
                    <h3 className="font-title-sm mb-4" style={{ color: "var(--color-on-surface)" }}>
                      Gandhinagar Depot <ArrowRight className="inline w-4 h-4 mx-1" /> Ahmedabad Hub
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
                        <Truck className="w-4 h-4" />
                        <span className="text-sm">VAN-05 / ALEX</span>
                      </div>
                      <div className="flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">45 min in transit</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 rounded-full transition-colors hover:bg-surface-container-highest">
                    <MoreVertical className="w-4 h-4" style={{ color: "var(--color-on-surface-variant)" }} />
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center gap-4" style={{ borderColor: "color-mix(in srgb, var(--color-outline-variant) 30%, transparent)" }}>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="h-full rounded-full w-[65%]" style={{ backgroundColor: "var(--color-secondary)" }} />
                  </div>
                  <span className="font-data-mono text-xs shrink-0" style={{ color: "var(--color-secondary)" }}>65%</span>
                </div>
              </div>

              {/* TR004 — Draft */}
              <div
                className="border rounded-lg p-stack_lg relative overflow-hidden opacity-80 transition-all"
                style={{
                  backgroundColor: "var(--color-surface-container)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--color-outline-variant)" }} />
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-data-mono text-sm" style={{ color: "var(--color-on-surface-variant)" }}>TR004</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                    style={{ backgroundColor: "var(--color-surface-variant)", color: "var(--color-on-surface-variant)" }}
                  >Draft</span>
                </div>
                <h3 className="font-title-sm mb-4" style={{ color: "var(--color-on-surface)" }}>
                  Vatva Industrial Area <ArrowRight className="inline w-4 h-4 mx-1" /> Sanand Warehouse
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    <Truck className="w-4 h-4" />
                    <span className="text-sm">TRUCK-04 / SURESH</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    <Hourglass className="w-4 h-4" />
                    <span className="text-sm italic">Awaiting driver confirmation</span>
                  </div>
                </div>
              </div>

              {/* TR006 — Cancelled */}
              <div
                className="border rounded-lg p-stack_lg relative overflow-hidden opacity-70 transition-all"
                style={{
                  backgroundColor: "var(--color-surface-container)",
                  borderColor: "color-mix(in srgb, var(--color-error) 20%, transparent)",
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--color-error)" }} />
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-data-mono text-sm" style={{ color: "var(--color-error)" }}>TR006</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-error-container) 20%, transparent)",
                      color: "var(--color-error)",
                    }}
                  >Cancelled</span>
                </div>
                <h3 className="font-title-sm mb-4" style={{ color: "var(--color-on-surface-variant)" }}>
                  Mansa <ArrowRight className="inline w-4 h-4 mx-1" /> Kalol Depot
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2" style={{ color: "color-mix(in srgb, var(--color-error) 60%, transparent)" }}>
                    <UserX className="w-4 h-4" />
                    <span className="text-sm">Unassigned</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    <Info className="w-4 h-4" />
                    <span className="text-sm">Vehicle sent to shop</span>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              <div
                className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-2 text-center opacity-50"
                style={{ borderColor: "color-mix(in srgb, var(--color-outline-variant) 30%, transparent)" }}
              >
                <PlusCircle className="w-8 h-8" style={{ color: "var(--color-outline-variant)" }} />
                <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                  No other active trips. Dispatch from the left panel.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 group"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        title="Quick Dispatch"
      >
        <Plus className="w-5 h-5" />
        <span
          className="absolute right-16 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border"
          style={{
            backgroundColor: "var(--color-surface-container)",
            color: "var(--color-on-surface)",
            borderColor: "var(--color-outline-variant)",
          }}
        >
          Quick Dispatch
        </span>
      </button>
    </RoleGuard>
  );
}
