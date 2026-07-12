# Remaining Pages Migration Guide

This document provides quick copy-paste patterns for migrating the remaining pages. All heavy lifting (hooks, providers, components) is already done.

## Already Completed ✅

- ✅ React Query setup with QueryProvider
- ✅ Comprehensive hooks in `client/hooks/queries.ts`
- ✅ DataStates component (LoadingSpinner, ErrorState, EmptyState)
- ✅ Dashboard page with real KPIs
- ✅ Maintenance page with form and table

## Pages Remaining

### 1. Fuel Page (PRIORITY 1 - Started)

**File:** `client/app/(dashboard)/fuel/page.tsx`

**Already Updated:**
- Imports changed to use React Query
- Component logic updated to fetch real fuel logs

**Still Needs:**
- Update table rendering to loop through `fuelLogs` with loading/error states
- Add filter tabs that switch between Fuel and Expenses

**Quick Pattern:**
```tsx
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorState error={error as Error} />
) : allItems.length === 0 ? (
  <EmptyState />
) : (
  <table>
    {allItems.map((item: any) => (
      <tr key={item.id}>
        <td>{item.date}</td>
        <td>{item.amount}</td>
        <td>${item.cost}</td>
        {/* Add other columns */}
      </tr>
    ))}
  </table>
)}
```

### 2. Expenses Page

**File:** `client/app/(dashboard)/expenses/page.tsx`

**Pattern:**
- Import: `import { useExpenses } from "@/hooks/queries";`
- Add state: `const { data: expenses = [], isLoading, error } = useExpenses();`
- Use same LoadingSpinner/ErrorState pattern as fuel
- Render expenses table with columns: Date, Category, Amount, Status

### 3. Analytics Page

**File:** `client/app/(dashboard)/analytics/page.tsx`

**Pattern:**
```tsx
import { useAnalyticsMetrics, useAnalyticsCharts } from "@/hooks/queries";

export default function AnalyticsPage() {
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics();
  const { data: charts, isLoading: chartsLoading } = useAnalyticsCharts();
  
  // Use metrics and charts data in existing chart components
}
```

### 4. Reports Page

**File:** `client/app/(dashboard)/reports/page.tsx`

**Pattern:**
```tsx
import { useReports, useGenerateReport } from "@/hooks/queries";

export default function ReportsPage() {
  const { data: reports = [], isLoading, error } = useReports();
  const generateReport = useGenerateReport();
  
  const handleGenerate = async () => {
    await generateReport.mutateAsync({
      type: "fuel",
      dateRange: { start: "...", end: "..." }
    });
  };
}
```

### 5. Audit Logs Page

**File:** `client/app/(dashboard)/audit-logs/page.tsx`

**Pattern:**
```tsx
import { useAuditLogs } from "@/hooks/queries";
import { LoadingSpinner, ErrorState } from "@/components/ui/DataStates";

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({ user: "", action: "" });
  const { data: logs = [], isLoading, error } = useAuditLogs(filters);
  
  // Render logs table with pagination
}
```

## Query Hook Signatures

All hooks in `client/hooks/queries.ts` follow these patterns:

```tsx
// Fetch hooks
useVehicles(filters?) → { data, isLoading, error }
useDrivers(filters?) → { data, isLoading, error }
useTrips(filters?) → { data, isLoading, error }
useMaintenance(filters?) → { data, isLoading, error }
useFuelLogs(filters?) → { data, isLoading, error }
useExpenses(filters?) → { data, isLoading, error }
useAnalyticsMetrics(filters?) → { data, isLoading, error }
useAnalyticsCharts(filters?) → { data, isLoading, error }
useReports(filters?) → { data, isLoading, error }
useAuditLogs(filters?) → { data, isLoading, error }
useDashboardKPIs() → { data, isLoading, error }
useDashboardCharts() → { data, isLoading, error }

// Mutation hooks
useCreateVehicle() → mutateAsync(payload)
useUpdateVehicle() → mutateAsync({ id, ...payload })
useDeleteVehicle() → mutateAsync(id)
useCreateMaintenance() → mutateAsync(payload)
useCreateFuelLog() → mutateAsync(payload)
useCreateExpense() → mutateAsync(payload)
useGenerateReport() → mutateAsync(params)
// ... similar for drivers, trips, etc.
```

## API Response Format

All endpoints return:
```json
{
  "success": true,
  "message": "Success message",
  "data": {...}  // Array or single object
}
```

## Common Implementation Steps

1. **Add imports** at the top of component:
   ```tsx
   import { useYourHook } from "@/hooks/queries";
   import { LoadingSpinner, ErrorState, EmptyState } from "@/components/ui/DataStates";
   ```

2. **Call hook** in component:
   ```tsx
   const { data = [], isLoading, error } = useYourHook();
   ```

3. **Add conditional rendering**:
   ```tsx
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorState error={error} />;
   if (data.length === 0) return <EmptyState />;
   ```

4. **Render data** using existing table/chart structures

5. **Add mutations** for form submissions:
   ```tsx
   const createItem = useCreateItem();
   
   const handleSubmit = async (formData) => {
     await createItem.mutateAsync(formData);
   };
   ```

## Testing Checklist

After migrating each page:
- [ ] Page loads without errors
- [ ] Loading state displays while fetching
- [ ] Data displays after fetch completes
- [ ] Error state shows if API fails
- [ ] Filters/search works if present
- [ ] Form submission works (mutations)
- [ ] UI styling unchanged

## Backend Expected Endpoints

```
GET /dashboard/kpis
GET /dashboard/charts
GET /vehicles
GET /drivers
GET /trips
GET /maintenance
GET /fuel-logs
GET /expenses
GET /analytics/metrics
GET /analytics/charts
GET /reports
GET /audit-logs

POST /maintenance
POST /fuel-logs
POST /expenses
POST /reports/generate

PUT /vehicles/:id
PUT /drivers/:id
PUT /maintenance/:id

PATCH /trips/:id

DELETE /vehicles/:id
```

## Token Usage Notes

- All queries cache for 5 minutes by default (configurable in QueryProvider)
- Dashboard KPIs refresh every 30 seconds for real-time feel
- Mutations auto-invalidate related queries
- Use `enabled` prop in hooks to conditionally fetch
