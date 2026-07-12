'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../providers/AppProvider';
import { TripStatus } from '../types';
import {
  FileText,
  Send,
  CheckCircle,
  Truck,
  Users,
  AlertTriangle,
  Info,
  Clock,
  XCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export const DispatcherConsole = () => {
  const {
    vehicles,
    drivers,
    trips,
    createTrip,
    dispatchTrip,
    cancelTrip
  } = useAppContext();

  // Form State
  const [source, setSource] = useState('Anandnagar Depot');
  const [destination, setDestination] = useState('Ahmedabad Hub');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState(200);
  const [consignmentCode, setConsignmentCode] = useState('C-901');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [step, setStep] = useState<number>(0); // 0: Draft, 1: Dispatched, 2: In-Transit, 3: Completed (visual stepper)

  // Validation
  const [capacityError, setCapacityError] = useState(false);
  const [exceededAmount, setExceededAmount] = useState(0);
  const [selectedVehicleCapacity, setSelectedVehicleCapacity] = useState(0);

  // Set default values when available
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');

  useEffect(() => {
    if (availableVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(availableVehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  useEffect(() => {
    if (availableDrivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(availableDrivers[0].id);
    }
  }, [drivers, selectedDriverId]);

  // Capacity check effect
  useEffect(() => {
    const veh = vehicles.find(v => v.id === selectedVehicleId);
    if (veh) {
      setSelectedVehicleCapacity(veh.capacity);
      if (cargoWeight > veh.capacity) {
        setCapacityError(true);
        setExceededAmount(cargoWeight - veh.capacity);
      } else {
        setCapacityError(false);
        setExceededAmount(0);
      }
    } else {
      setCapacityError(false);
      setExceededAmount(0);
      setSelectedVehicleCapacity(0);
    }
  }, [selectedVehicleId, cargoWeight, vehicles]);

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (capacityError && !isDraft) return; // Block dispatch if capacity exceeded

    const veh = vehicles.find(v => v.id === selectedVehicleId);
    const drv = drivers.find(d => d.id === selectedDriverId);

    const tripData = {
      source,
      destination,
      vehicleId: selectedVehicleId,
      vehicleName: veh?.name || '',
      driverId: selectedDriverId,
      driverName: drv?.name || '',
      cargoWeight,
      consignmentCode,
      status: (isDraft ? 'DRAFT' : 'DISPATCHED') as TripStatus,
      eta: isDraft ? 'Awaiting dispatch' : '45 min'
    };

    createTrip(tripData);

    // Reset Form Fields (keep default source/destination)
    if (availableVehicles.length > 1) {
      // Find another available vehicle
      const otherVeh = availableVehicles.find(v => v.id !== selectedVehicleId);
      if (otherVeh) setSelectedVehicleId(otherVeh.id);
    }
    if (availableDrivers.length > 1) {
      const otherDrv = availableDrivers.find(d => d.id !== selectedDriverId);
      if (otherDrv) setSelectedDriverId(otherDrv.id);
    }

    setConsignmentCode(`C-${Math.floor(Math.random() * 900) + 100}`);
    setCargoWeight(200);
    setStartTime('');
    setEndTime('');
    alert(isDraft ? 'Trip saved as Draft.' : 'Trip successfully dispatched!');
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'DRAFT':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-zinc-50 text-zinc-500 border-zinc-100';
    }
  };

  const getStatusText = (status: TripStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return 'Dispatched';
      case 'COMPLETED':
        return 'Completed';
      case 'DRAFT':
        return 'Draft';
      case 'CANCELLED':
        return 'Cancelled';
    }
  };

  // Dispatcher live summary text
  const totalResources = vehicles.length + drivers.length;
  const activeResources = vehicles.filter(v => v.status === 'ON_TRIP').length + drivers.filter(d => d.status === 'ON_TRIP').length;
  const noActionCount = totalResources - activeResources;

  return (
    <div className="space-y-6">
      {/* Trip Lifecycle Stepper Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-4">Trip Lifecycle</h3>
        <div className="flex items-center w-full max-w-3xl mx-auto">
          {/* Step 1: Draft */}
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
              step >= 0 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}>
              1
            </div>
            <div className="ml-3">
              <p className="text-xs font-bold text-zinc-800">Draft</p>
              <p className="text-[10px] text-zinc-400">Setup details</p>
            </div>
          </div>
          
          <div className={`h-0.5 flex-1 mx-4 ${step >= 1 ? 'bg-indigo-600' : 'bg-zinc-200'}`}></div>

          {/* Step 2: Dispatched */}
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
              step >= 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}>
              2
            </div>
            <div className="ml-3">
              <p className="text-xs font-bold text-zinc-800">Dispatched</p>
              <p className="text-[10px] text-zinc-400">Assigned & ready</p>
            </div>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-zinc-200'}`}></div>

          {/* Step 3: In Transit */}
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
              step >= 2 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}>
              3
            </div>
            <div className="ml-3">
              <p className="text-xs font-bold text-zinc-800">In-Transit</p>
              <p className="text-[10px] text-zinc-400">En route to hub</p>
            </div>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-zinc-200'}`}></div>

          {/* Step 4: Completed */}
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
              step >= 3 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}>
              4
            </div>
            <div className="ml-3">
              <p className="text-xs font-bold text-zinc-800">Completed</p>
              <p className="text-[10px] text-zinc-400">Trip closed out</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Create Form (Left) & Live Board (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CREATE TRIP FORM */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 mb-5">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-zinc-800">Create Trip</h2>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Source Depot</label>
                <input
                  type="text"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                  placeholder="e.g. Anandnagar Depot"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Destination Hub</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                  placeholder="e.g. Ahmedabad Hub"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Vehicle Assignment</label>
              {availableVehicles.length > 0 ? (
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50 cursor-pointer"
                >
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type}) - Max Cap: {v.capacity} kg
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex gap-2 items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>No available vehicles. Free up one or close maintenance!</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Driver Assignment</label>
              {availableDrivers.length > 0 ? (
                <select
                  required
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50 cursor-pointer"
                >
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (License: {d.licenseCategory}) - Safety Score: {d.safetyScore}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex gap-2 items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>No drivers available. Release drivers from existing trips!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Consignment Weight (kg)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Consignment Code</label>
                <input
                  type="text"
                  required
                  value={consignmentCode}
                  onChange={(e) => setConsignmentCode(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Planned Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Planned End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-zinc-50/50"
                />
              </div>
            </div>

            {/* Capacity Error Box */}
            {capacityError && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex gap-3 items-start animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <span className="font-bold text-rose-800">Dispatch Blocked!</span>
                  <p className="mt-1 leading-normal text-[11px]">
                    Vehicle Capacity: <span className="font-bold">{selectedVehicleCapacity} kg</span>
                    <br />
                    Cargo Weight: <span className="font-bold">{cargoWeight} kg</span>
                    <br />
                    <span className="font-semibold text-rose-900">
                      Capacity exceeded by {exceededAmount} kg.
                    </span>{' '}
                    Please assign a higher-capacity vehicle or reduce consignment payload.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={capacityError || !selectedVehicleId || !selectedDriverId}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  capacityError || !selectedVehicleId || !selectedDriverId
                    ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 active:scale-[0.98]'
                }`}
              >
                <Send className="w-4 h-4" />
                Dispatch Trip
              </button>

              <button
                type="button"
                onClick={(e) => {
                  handleSubmit(e, true);
                }}
                disabled={!selectedVehicleId}
                className="px-4 py-3 border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
              >
                Save Draft
              </button>
            </div>
          </form>
        </div>

        {/* LIVE BOARD */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-zinc-800">Live Board</h2>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 rounded-full">
                Active Queue
              </span>
            </div>

            {/* List of Trips */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 border border-zinc-100 bg-zinc-50/30 rounded-xl flex items-center justify-between gap-4 hover:border-zinc-200 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400 group-hover:text-indigo-600 transition-colors">
                        {trip.id}
                      </span>
                      <span className="text-sm font-semibold text-zinc-800">
                        {trip.source} → {trip.destination}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Vehicle: {trip.vehicleName || 'Awaiting'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Driver: {trip.driverName || 'Awaiting'}</span>
                      </div>
                      <div className="px-1.5 py-0.5 bg-zinc-100 rounded text-[10px] text-zinc-600">
                        Weight: {trip.cargoWeight} kg
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {getStatusText(trip.status)}
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-1">{trip.eta}</p>
                    </div>

                    {/* Dispatcher Actions inline */}
                    {trip.status === 'DRAFT' && (
                      <div className="flex items-center gap-1 pl-2 border-l border-zinc-200">
                        <button
                          onClick={() => {
                            if (!trip.vehicleId || !trip.driverId) {
                              alert('Please assign a vehicle and driver in edit before dispatching.');
                              return;
                            }
                            dispatchTrip(trip.id);
                          }}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          title="Dispatch Now"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => cancelTrip(trip.id, 'Operator cancelled')}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Cancel Trip"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {trips.length === 0 && (
                <div className="py-12 text-center text-sm text-zinc-400">
                  No trips currently dispatched or in draft queue.
                </div>
              )}
            </div>
          </div>

          {/* Resources Summary Footer */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-xs flex gap-3 items-center mt-6">
            <Info className="w-4 h-4 shrink-0 text-indigo-600" />
            <span className="font-medium">
              No dispatcher action required for <span className="font-bold">{noActionCount}/{totalResources}</span> resources. Available vehicle & driver assets ready.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
