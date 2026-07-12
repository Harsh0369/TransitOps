# API Integration Summary

Complete migration from mock data to real backend APIs using React Query for state management, caching, and synchronization.

## What Was Changed

### Dependencies Added
- `@tanstack/react-query` - For data fetching, caching, and state management

### New Files Created

1. **`client/hooks/queries.ts`** (226 lines)
   - Centralized React Query hooks for all API endpoints
   - Hooks for CRUD operations on vehicles, drivers, trips, maintenance, fuel, expenses, and dashboard
   - Automatic query invalidation after mutations
   - Dashboard queries with 30-second refetch interval for real-time updates

2. **`client/providers/QueryProvider.tsx`** (26 lines)
   - QueryClientProvider setup with optimized defaults
   - 5-minute stale time, 10-minute cache retention
   - Automatic retry on failure

3. **`client/components/ui/DataStates.tsx`** (30 lines)
   - Reusable loading spinner
   - Error state display component
   - Empty state placeholder component

### Modified Files

1. **`client/app/layout.tsx`**
   - Wrapped app with `QueryProvider` to enable React Query globally
   - All components now have access to query hooks

2. **`client/app/(dashboard)/vehicles/page.tsx`**
   - Removed: `import { vehicles, fleetSummaryStats } from "@/lib/mockData"`
   - Added: `useVehicles()` hook for real API data
   - Dynamic stats cards calculated from real vehicle data
   - Loading and error states
   - Vehicles filtered on client-side after API fetch

3. **`client/app/(dashboard)/drivers/page.tsx`**
   - Removed: `import { drivers, driverMetrics } from "@/lib/mockData"`
   - Added: `useDrivers()` hook for real API data
   - Dynamic metric cards calculated from driver array
   - Tab-based filtering (All Drivers, On Trip, Off Duty, Suspended)
   - Loading and error states with proper pagination display

4. **`client/app/(dashboard)/trips/page.tsx`**
   - Removed: `import { liveTrips, availableVehiclesForTrip, availableDriversForTrip } from "@/lib/mockData"`
   - Added: `useTrips()`, `useCreateTrip()`, `useUpdateTrip()`, `useVehicles()`, `useDrivers()` hooks
   - Dynamic vehicle/driver dropdowns from real API (filtered by status)
   - Real trip dispatch with validation and loading state
   - Dynamic live board rendering from trips array
   - Trip-specific styling based on status

## API Endpoints Expected

Backend should provide these endpoints:

```
GET    /api/vehicles              - Get all vehicles
POST   /api/vehicles              - Create vehicle
PUT    /api/vehicles/:id          - Update vehicle
DELETE /api/vehicles/:id          - Delete vehicle

GET    /api/drivers               - Get all drivers
POST   /api/drivers               - Create driver
PUT    /api/drivers/:id           - Update driver
DELETE /api/drivers/:id           - Delete driver

GET    /api/trips                 - Get all trips
POST   /api/trips                 - Create trip
PATCH  /api/trips/:id             - Update trip

GET    /api/maintenance           - Get maintenance records
POST   /api/maintenance           - Create maintenance record

GET    /api/fuel                  - Get fuel logs
POST   /api/fuel                  - Create fuel log

GET    /api/expenses              - Get expenses
POST   /api/expenses              - Create expense

GET    /api/dashboard/kpis        - Get dashboard KPIs
GET    /api/dashboard/charts      - Get chart data
```

## Expected Response Format

All API responses should follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    { "id": 1, "name": "Vehicle 1", ... },
    { "id": 2, "name": "Vehicle 2", ... }
  ]
}
```

For single item operations:

```json
{
  "success": true,
  "message": "Vehicle created",
  "data": { "id": 1, "name": "Vehicle 1", ... }
}
```

## Data Models

### Vehicle
```typescript
{
  id: string
  regNo: string              // Registration number
  name: string               // Vehicle name/model
  type: string               // Van, Truck, Mini
  capacity: string           // Cargo capacity
  odometer: string           // Current odometer reading
  acqCost: string            // Acquisition cost
  status: string             // Available, On Trip, In Shop, Retired
}
```

### Driver
```typescript
{
  id: string
  initials: string           // Name initials for avatar
  name: string               // Full name
  license: string            // License number
  category: string           // LMV, HMV
  expiry: string             // License expiry date
  expiryWarn: boolean        // Is expiring soon
  contact: string            // Phone number
  tripPct: string            // Trip percentage
  safetyScore: number        // Safety score (0-100)
  status: string             // Available, On Trip, Off Duty, Suspended
}
```

### Trip
```typescript
{
  id: string
  status: string             // Draft, Dispatched, Completed, Cancelled
  source: string             // Source location
  destination: string        // Destination location
  vehicle: string            // Vehicle name/ID
  driver: string             // Driver name/ID
  eta: string                // Estimated time of arrival
  progress: number           // Trip progress percentage (0-100)
  cargoWeight: number        // Cargo weight in kg
  distance: number           // Distance in km
}
```

## Features Implemented

### Automatic Query Caching
- 5-minute stale time for fresh data
- 10-minute cache retention
- Automatic refetch on window focus
- Configurable per query type

### Loading States
- `LoadingSpinner` component shown during API fetch
- Disabled buttons and form inputs while submitting
- Animated spinner with "Sending..." labels

### Error Handling
- `ErrorState` component displays error messages
- Automatic retry on failure (1 attempt by default)
- User-friendly error messages from API

### Query Invalidation
- Automatic cache invalidation after mutations
- Vehicles page updates after vehicle CRUD operations
- Drivers page updates after driver CRUD operations
- Trips page updates after trip creation/update
- Dashboard auto-refetches every 30 seconds

### Optimistic Updates
- Ready for implementation if needed
- Structure supports optimistic UI updates

## Usage in Components

### Fetching Data
```tsx
import { useVehicles } from "@/hooks/queries";

function MyComponent() {
  const { data: vehicles = [], isLoading, error } = useVehicles();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div>
      {vehicles.map(v => <div key={v.id}>{v.name}</div>)}
    </div>
  );
}
```

### Mutating Data
```tsx
import { useCreateVehicle } from "@/hooks/queries";

function AddVehicle() {
  const createVehicle = useCreateVehicle();
  
  const handleSubmit = async (data) => {
    try {
      await createVehicle.mutateAsync(data);
      // Query automatically invalidated and refetched
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Testing the Integration

1. **Start Backend**
   ```bash
   cd server && npm run dev  # Runs on port 8000
   ```

2. **Start Frontend**
   ```bash
   cd client && npm run dev  # Runs on port 3000
   ```

3. **Test Endpoints**
   - Navigate to `/dashboard/vehicles` - should fetch real vehicles
   - Navigate to `/dashboard/drivers` - should fetch real drivers
   - Navigate to `/dashboard/trips` - should fetch real trips
   - Try creating a new trip - should see loading state and then success

## Remaining Pages to Migrate

The following pages still have mock data and should be updated similarly:

- Dashboard (`/dashboard`) - Update dashboard charts and KPIs
- Maintenance (`/maintenance`) - Use `useMaintenance()` hook
- Fuel (`/fuel`) - Use `useFuelLogs()` hook
- Expenses (`/expenses`) - Use `useExpenses()` hook
- Analytics (`/analytics`) - Use dashboard hooks
- Reports (`/reports`) - Use dashboard hooks
- Audit Logs (`/audit-logs`) - Custom API endpoint needed

## Architecture Benefits

1. **Single Source of Truth** - All API calls centralized in `/hooks/queries.ts`
2. **Automatic Cache Management** - React Query handles stale data, refetching, and invalidation
3. **Built-in Deduplication** - Same queries requested multiple times only fetch once
4. **Easy to Debug** - React Query DevTools can be added for inspection
5. **Type Safe** - TypeScript support for all hooks
6. **Performance** - Background refetching keeps UI in sync without blocking
