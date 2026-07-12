// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardMetrics = {
  activeVehicles: 53,
  availableVehicles: 42,
  maintenance: 5,
  activeTrips: 18,
  pendingTrips: 9,
  drivers: 26,
  utilization: 81
};

export const recentTrips = [
  { id: "TR001-A", vehicle: "VAN-05", driver: "Alex J.", status: "On Trip", eta: "45 min" },
  { id: "TR002-B", vehicle: "TRK-12", driver: "John D.", status: "Completed", eta: "--" },
  { id: "TR003-C", vehicle: "MINI-08", driver: "Priya S.", status: "Dispatched", eta: "1h 10m" },
  { id: "TR004-D", vehicle: "--", driver: "--", status: "Draft", eta: "Awaiting vehicle" },
  { id: "TR005-E", vehicle: "VAN-22", driver: "Mike R.", status: "On Trip", eta: "12 min" },
];

export const vehicleStatusOverview = [
  { label: "Available", count: 42, color: "bg-emerald-400" },
  { label: "On Trip", count: 53, color: "bg-blue-500" },
  { label: "In Shop (Maintenance)", count: 5, color: "bg-amber-500" },
  { label: "Retired / Spare", count: 2, color: "bg-red-400" }
];

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export const vehicles = [
  { regNo: "GJ01AB452", name: "VAN-05 (Sprinter Pro)", type: "Van", capacity: "500 kg", odometer: "74,000", acqCost: "6,20,000", status: "Available" },
  { regNo: "GJ01AB998", name: "TRUCK-11 (Heavy Duty)", type: "Truck", capacity: "5 Ton", odometer: "1,82,000", acqCost: "24,50,000", status: "On Trip" },
  { regNo: "GJ01AB1120", name: "MINI-03 (Express City)", type: "Mini", capacity: "1 Ton", odometer: "66,000", acqCost: "4,10,000", status: "In Shop" },
  { regNo: "GJ01AB008", name: "VAN-09 (Classic)", type: "Van", capacity: "750 kg", odometer: "2,41,900", acqCost: "5,90,000", status: "Retired" },
  { regNo: "GJ01AC211", name: "TRUCK-04 (Road King)", type: "Truck", capacity: "8 Ton", odometer: "3,10,450", acqCost: "31,00,000", status: "Available" },
  { regNo: "GJ01AC390", name: "MINI-07 (City Zip)", type: "Mini", capacity: "800 kg", odometer: "28,700", acqCost: "3,75,000", status: "On Trip" },
];

export const fleetSummaryStats = [
  { label: "Operational Fleet", value: "142", sub: "Vehicles", borderColor: "border-l-emerald-500" },
  { label: "On Mission", value: "86", sub: "Active Trips", borderColor: "border-l-blue-500" },
  { label: "Under Repair", value: "12", sub: "Vehicles", borderColor: "border-l-amber-500" },
  { label: "Retired Units", value: "4", sub: "Finalized", borderColor: "border-l-red-400" },
];

// ─── Drivers ─────────────────────────────────────────────────────────────────

export const drivers = [
  { initials: "AA", name: "Alex Anderson", license: "DL-88213", category: "LMV", expiry: "12/2028", expiryWarn: false, contact: "98765-XXXXX", tripPct: "96%", safetyScore: 98, status: "Available" },
  { initials: "JS", name: "John Smith", license: "DL-44120", category: "HMV", expiry: "03/2025", expiryWarn: true, contact: "98220-XXXXX", tripPct: "81%", safetyScore: 76, status: "Suspended" },
  { initials: "PK", name: "Priya Kumari", license: "DL-77031", category: "LMV", expiry: "08/2029", expiryWarn: false, contact: "99110-XXXXX", tripPct: "99%", safetyScore: 99, status: "On Trip" },
  { initials: "SN", name: "Suresh Nair", license: "DL-90045", category: "HMV", expiry: "01/2027", expiryWarn: false, contact: "97440-XXXXX", tripPct: "88%", safetyScore: 92, status: "Off Duty" },
];

export const driverMetrics = {
  activeDrivers: 142,
  onTrip: 89,
  avgSafetyScore: 94,
  criticalAlerts: 3,
};

// ─── Trips Live Board ─────────────────────────────────────────────────────────

export const liveTrips = [
  {
    id: "TR001",
    status: "Dispatched",
    source: "Gandhinagar Depot",
    destination: "Ahmedabad Hub",
    vehicle: "VAN-05",
    driver: "ALEX",
    eta: "45 min in transit",
    progress: 65,
  },
  {
    id: "TR004",
    status: "Draft",
    source: "Vatva Industrial Area",
    destination: "Sanand Warehouse",
    vehicle: "TRUCK-04",
    driver: "SURESH",
    eta: null,
    awaiting: "Awaiting driver confirmation",
    progress: 0,
  },
  {
    id: "TR006",
    status: "Cancelled",
    source: "Mansa",
    destination: "Kalol Depot",
    vehicle: null,
    driver: null,
    eta: null,
    awaiting: "Vehicle sent to shop",
    progress: 0,
  },
];

export const availableVehiclesForTrip = [
  { id: "van-05", label: "VAN-05 — 500 kg capacity" },
  { id: "van-09", label: "VAN-09 — 750 kg capacity" },
  { id: "mini-07", label: "MINI-07 — 800 kg capacity" },
];

export const availableDriversForTrip = [
  { id: "alex", label: "Alex" },
  { id: "priya", label: "Priya" },
  { id: "suresh", label: "Suresh" },
];

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsKpis = [
  { label: "Fuel Efficiency", value: "8.4", unit: "km/L", icon: "Fuel" },
  { label: "Fleet Utilization", value: "81%", unit: "+3.2%", icon: "Gauge" },
  { label: "Operational Cost", value: "34,070", unit: "USD", icon: "DollarSign" },
  { label: "Vehicle ROI", value: "14.2%", unit: "Target Met", icon: "TrendingUp" },
];

export const monthlyRevenue = [
  { month: "JAN", value: 42000 },
  { month: "FEB", value: 55000 },
  { month: "MAR", value: 48000 },
  { month: "APR", value: 51000 },
  { month: "MAY", value: 62000 },
  { month: "JUN", value: 74000 },
  { month: "JUL", value: 68000 },
];

export const costliestVehicles = [
  { name: "TRUCK-11", cost: 14238, maxCost: 16000, note: "Maintenance heavy; Engine issues reported.", color: "bg-red-400" },
  { name: "MINI-03", cost: 8410, maxCost: 16000, note: "Fuel consumption above fleet average.", color: "bg-amber-500" },
  { name: "VAN-05", cost: 3150, maxCost: 16000, note: "Standard wear and tear.", color: "bg-blue-400" },
];

export const recentAlerts = [
  { level: "critical", message: "Critical Engine Failure - TRUCK-11", sub: "Maintenance bay 04 occupied by technician Mark S.", time: "14:23 PM" },
  { level: "info", message: "Optimized Route Assigned - VAN-02", sub: "Expected fuel reduction of 8% for this leg.", time: "12:05 PM" },
];

// ─── Maintenance ──────────────────────────────────────────────────────────────

export const maintenanceStats = {
  activeMaintenance: 12,
  monthExpenditure: "$24.8K",
  avgTurnaround: "1.4",
};

export const serviceLog = [
  { vehicle: "VAN-05",   type: "Van",   service: "Oil Change",         date: "Oct 24, 2026", cost: "$2,500.00",  status: "In Shop"   },
  { vehicle: "TRUCK-11", type: "Truck", service: "Engine Repair",      date: "Oct 21, 2026", cost: "$18,000.00", status: "Completed" },
  { vehicle: "MINI-02",  type: "Van",   service: "Tyre Replace",       date: "Oct 19, 2026", cost: "$6,200.00",  status: "In Shop"   },
  { vehicle: "TRUCK-04", type: "Truck", service: "Brake Inspection",   date: "Oct 15, 2026", cost: "$1,250.00",  status: "Completed" },
  { vehicle: "VAN-02",   type: "Van",   service: "Fluid Flush",        date: "Oct 12, 2026", cost: "$850.00",    status: "Completed" },
  { vehicle: "MINI-05",  type: "Van",   service: "Routine Maintenance",date: "Oct 08, 2026", cost: "$3,100.00",  status: "In Shop"   },
];

// ─── Fuel & Expenses ─────────────────────────────────────────────────────────

export const fuelLogs = [
  { vehicle: "VAN-05",   type: "Van",   date: "05 Jul 2026", liters: 42,  cost: 3150 },
  { vehicle: "TRUCK-11", type: "Truck", date: "06 Jul 2026", liters: 110, cost: 8400 },
  { vehicle: "MINI-08",  type: "Van",   date: "06 Jul 2026", liters: 28,  cost: 2050 },
];

export const otherExpenses = [
  { tripId: "TR001", vehicle: "VAN-05", toll: 120, other: 0,   maint: 0,     status: "Available" },
  { tripId: "TR002", vehicle: "TRK-12", toll: 340, other: 150, maint: 18000, status: "Completed" },
];


