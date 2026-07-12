"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { FormError } from "@/components/ui/FormError";
import { LoadingSpinner, ErrorState } from "@/components/ui/DataStates";
import { useFormError } from "@/hooks/useFormError";
import { useTrips, useCreateTrip, useVehicles, useDrivers } from "@/hooks/queries";
import { useState, useEffect } from "react";
import {
  Truck, Clock, MoreVertical, Check, AlertTriangle, X,
  Zap, Plus, ArrowRight, Hourglass, UserX, Info, Loader
} from "lucide-react";
import { clsx } from "clsx";

const TRIP_STEPS = ["Draft", "Dispatched", "Completed", "Cancelled"];

export default function TripsPage() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: trips = [], isLoading: tripsLoading, error: tripsError } = useTrips();
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const createTrip = useCreateTrip();
  const { error, fieldErrors, handleError, clearError } = useFormError();

  const selectedVehicle = vehicles.find((v: any) => v.id === vehicleId);
  const capacity = selectedVehicle?.capacity ? parseInt(selectedVehicle.capacity) : 500;
  const overCapacity = cargoWeight > capacity;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage("");

    if (!vehicleId || !driverId) {
      handleError(new Error("Please select vehicle and driver"));
      return;
    }

    if (overCapacity) {
      handleError(new Error(`Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${capacity}kg)`));
      return;
    }

    setIsSubmitting(true);
    try {
      await createTrip.mutateAsync({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight,
        distance,
        status: "Dispatched",
      });

      setSuccessMessage("Trip dispatched successfully!");
      // Reset form
      setSource("");
      setDestination("");
      setVehicleId("");
      setDriverId("");
      setCargoWeight(0);
      setDistance(0);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["FLEET_MANAGER", "DRIVER"]}>
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

              {/* Error/Success Messages */}
              {error && <FormError error={error} fieldErrors={fieldErrors} />}
              {successMessage && (
                <div className="p-3 rounded-lg border border-green-500/20 bg-green-950/40">
                  <p className="text-sm text-green-200">{successMessage}</p>
                </div>
              )}

              {/* Form fields */}
              <form className="space-y-stack_md" onSubmit={handleDispatch}>
                <div className="grid grid-cols-2 gap-stack_md">
                  {[
                    { label: "Source", value: source, onChange: setSource, placeholder: "Origin location" },
                    { label: "Destination", value: destination, onChange: setDestination, placeholder: "Final destination" },
                  ].map(({ label, value, onChange, placeholder }) => (
                    <div key={label} className="space-y-1">
                      <label className="font-label-caps text-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={isSubmitting}
                        className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none disabled:opacity-50"
                        style={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: fieldErrors[label.toLowerCase()] ? "var(--color-error)" : "var(--color-outline-variant)",
                          color: "var(--color-on-surface)",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-outline-variant)"; }}
                        required
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
                    disabled={isSubmitting}
                    className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: fieldErrors.vehicleId ? "var(--color-error)" : "var(--color-outline-variant)",
                      color: "var(--color-on-surface)",
                    }}
                    required
                  >
                    <option value="">Select a vehicle...</option>
                    {vehicles.filter((v: any) => v.status === "Available").map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name} - {v.capacity}kg</option>
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
                    disabled={isSubmitting}
                    className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: fieldErrors.driverId ? "var(--color-error)" : "var(--color-outline-variant)",
                      color: "var(--color-on-surface)",
                    }}
                    required
                  >
                    <option value="">Select a driver...</option>
                    {drivers.filter((d: any) => d.status === "Available" || d.status === "On Trip").map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
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
                      disabled={isSubmitting}
                      className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none font-bold disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: overCapacity ? "var(--color-error)" : "var(--color-outline-variant)",
                        color: overCapacity ? "var(--color-error)" : "var(--color-on-surface)",
                      }}
                      required
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
                      disabled={isSubmitting}
                      className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-outline-variant)",
                        color: "var(--color-on-surface)",
                      }}
                      required
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
                    type="submit"
                    disabled={overCapacity || isSubmitting}
                    className={clsx(
                      "flex-1 py-3 rounded-lg font-label-caps text-label-caps flex items-center justify-center gap-2 transition-all",
                      overCapacity || isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
                    )}
                    style={
                      overCapacity || isSubmitting
                        ? { backgroundColor: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" }
                        : { backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        {overCapacity ? "Dispatch Disabled" : "Dispatch Trip"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSource("");
                      setDestination("");
                      setVehicleId("");
                      setDriverId("");
                      setCargoWeight(0);
                      setDistance(0);
                      clearError();
                      setSuccessMessage("");
                    }}
                    disabled={isSubmitting}
                    className="px-stack_lg py-3 rounded-lg font-label-caps text-label-caps transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-surface-variant)",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Helper tip */}
            <div
              className="p-stack_md border rounded-lg"
              style={{
                backgroundColor: "var(--color-surface-container-low)",
                borderColor: "color-mix(in srgb, var(--color-outline-variant) 50%, transparent)",
              }}
            >
              <p className="text-sm italic text-balance" style={{ color: "var(--color-on-surface-variant)" }}>
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

            {tripsLoading ? (
              <LoadingSpinner />
            ) : tripsError ? (
              <div className="p-6">
                <ErrorState error={tripsError as Error} />
              </div>
            ) : (
              <div className="space-y-stack_md">
                {trips.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400">
                    <p>No trips yet. Dispatch one from the left panel.</p>
                  </div>
                ) : (
                  trips.map((trip: any) => (
                    <div key={trip.id}
                      className={clsx("border rounded-lg p-stack_lg relative overflow-hidden transition-all", trip.status === "Dispatched" ? "hover:border-secondary group" : "")}
                      style={{
                        backgroundColor: trip.status === "Cancelled" ? "var(--color-surface-container)" : "var(--color-surface-container-high)",
                        borderColor: trip.status === "Dispatched" ? "color-mix(in srgb, var(--color-secondary) 30%, transparent)" : trip.status === "Cancelled" ? "color-mix(in srgb, var(--color-error) 20%, transparent)" : "var(--color-outline-variant)",
                        opacity: trip.status === "Cancelled" ? 0.7 : 1,
                      }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{
                        backgroundColor: trip.status === "Dispatched" ? "var(--color-secondary)" : trip.status === "Cancelled" ? "var(--color-error)" : "var(--color-outline-variant)"
                      }} />
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="font-data-mono text-sm" style={{
                              color: trip.status === "Dispatched" ? "var(--color-secondary)" : trip.status === "Cancelled" ? "var(--color-error)" : "var(--color-on-surface-variant)"
                            }} title={trip.id}>{trip.id.substring(0, 8)}</span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                              style={{
                                backgroundColor: trip.status === "Dispatched" ? "color-mix(in srgb, var(--color-secondary) 15%, transparent)" : trip.status === "Cancelled" ? "color-mix(in srgb, var(--color-error-container) 20%, transparent)" : "var(--color-surface-variant)",
                                color: trip.status === "Dispatched" ? "var(--color-secondary)" : trip.status === "Cancelled" ? "var(--color-error)" : "var(--color-on-surface-variant)",
                              }}
                            >{trip.status}</span>
                          </div>
                          <h3 className="font-title-sm mb-4" style={{ color: trip.status === "Cancelled" ? "var(--color-on-surface-variant)" : "var(--color-on-surface)" }}>
                            {trip.source} <ArrowRight className="inline w-4 h-4 mx-1" /> {trip.destination}
                          </h3>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
                              <Truck className="w-4 h-4" />
                              <span className="text-sm">{trip.vehicle?.name || trip.vehicleName || "Unassigned"} / {trip.driver?.name || trip.driverName || "Unassigned"}</span>
                            </div>
                            {trip.status === "Dispatched" && (
                              <div className="flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{trip.eta || "In transit"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button className="p-2 rounded-full transition-colors hover:bg-surface-container-highest">
                          <MoreVertical className="w-4 h-4" style={{ color: "var(--color-on-surface-variant)" }} />
                        </button>
                      </div>
                      {trip.status === "Dispatched" && (
                        <div className="mt-4 pt-4 border-t flex justify-between items-center gap-4" style={{ borderColor: "color-mix(in srgb, var(--color-outline-variant) 30%, transparent)" }}>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                            <div className="h-full rounded-full" style={{ width: `${trip.progress || 0}%`, backgroundColor: "var(--color-secondary)" }} />
                          </div>
                          <span className="font-data-mono text-xs shrink-0" style={{ color: "var(--color-secondary)" }}>{trip.progress || 0}%</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
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
