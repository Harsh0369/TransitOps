# API Integration Migration Checklist

## Completed ✅

- [x] Install React Query (`@tanstack/react-query`)
- [x] Create QueryProvider wrapper
- [x] Create centralized queries hook file
- [x] Update root layout with QueryProvider
- [x] Create DataStates component (loading/error/empty)
- [x] Migrate Vehicles page to real API
- [x] Migrate Drivers page to real API
- [x] Migrate Trips page to real API

## Remaining Pages to Migrate

### Dashboard (`/dashboard`) - HIGH PRIORITY
**File**: `client/app/(dashboard)/dashboard/page.tsx`
- [ ] Import `useDashboardKPIs` and `useDashboardCharts` from `@/hooks/queries`
- [ ] Replace mock metrics with real API data
- [ ] Add loading state for dashboard cards
- [ ] Add error handling for charts
- [ ] Components to update:
  - [ ] `DashboardView` component (check `components/DashboardView.tsx`)
  - [ ] KPI cards
  - [ ] Chart rendering

### Maintenance (`/maintenance`)
**File**: `client/app/(dashboard)/maintenance/page.tsx`
- [ ] Import `useMaintenance()` hook
- [ ] Remove mock data from `@/lib/mockData`
- [ ] Add maintenance records table with real data
- [ ] Implement "Create Maintenance" button with `useCreateMaintenance()`
- [ ] Add loading/error states

### Fuel Logs (`/fuel`)
**File**: `client/app/(dashboard)/fuel/page.tsx`
- [ ] Import `useFuelLogs()` hook
- [ ] Remove mock fuel logs
- [ ] Update fuel table with real data
- [ ] Implement "Add Fuel Log" button with `useCreateFuelLog()`
- [ ] Add loading/error states
- [ ] Update real-time cost calculation

### Expenses (`/expenses`)
**File**: `client/app/(dashboard)/expenses/page.tsx`
- [ ] Import `useExpenses()` hook
- [ ] Remove mock expense data
- [ ] Update expenses table with real data
- [ ] Implement "Add Expense" button with `useCreateExpense()`
- [ ] Add loading/error states

### Analytics (`/analytics`)
**File**: `client/app/(dashboard)/analytics/page.tsx`
- [ ] Import `useDashboardCharts()` hook
- [ ] Replace chart mock data with real API
- [ ] Add loading states for each chart
- [ ] Add error handling

### Reports (`/reports`)
**File**: `client/app/(dashboard)/reports/page.tsx`
- [ ] May use dashboard hooks
- [ ] Check if data is available in KPIs or needs custom endpoint
- [ ] Implement export functionality

### Audit Logs (`/audit-logs`)
**File**: `client/app/(dashboard)/audit-logs/page.tsx`
- [ ] May need custom API endpoint or use existing data
- [ ] Add to queries.ts if needed
- [ ] Implement pagination/filtering

### Settings (`/settings`)
**File**: `client/app/(dashboard)/settings/page.tsx`
- [ ] Check if settings are stored in backend
- [ ] Implement read/update settings if needed

## Backend API Endpoints Status

### ✅ Implemented in Frontend
- GET `/api/vehicles`
- GET `/api/drivers`
- GET `/api/trips`
- GET `/api/dashboard/kpis`
- GET `/api/dashboard/charts`

### ⏳ Need Backend Implementation
- POST `/api/vehicles`
- PUT `/api/vehicles/:id`
- DELETE `/api/vehicles/:id`
- POST `/api/drivers`
- PUT `/api/drivers/:id`
- DELETE `/api/drivers/:id`
- POST `/api/trips`
- PATCH `/api/trips/:id`
- GET `/api/maintenance`
- POST `/api/maintenance`
- GET `/api/fuel`
- POST `/api/fuel`
- GET `/api/expenses`
- POST `/api/expenses`
- GET `/api/audit-logs` (if needed)

## Testing Workflow

For each page migration:

1. **Check mock data source**
   ```bash
   grep -n "mockData\|from \"@/lib" client/app/(dashboard)/[page-name]/page.tsx
   ```

2. **Create/update hook in queries.ts**
   - Add `use[Feature]()` query hook
   - Add create/update/delete mutation hooks if needed

3. **Update component**
   - Remove mock imports
   - Add hook imports
   - Replace mock data with hook data
   - Add loading/error states
   - Test in browser

4. **Verify behavior**
   - Data loads correctly
   - Loading spinner appears during fetch
   - Error message appears if request fails
   - Real-time updates work

## Quick Migration Template

```tsx
// BEFORE
import { mockData } from "@/lib/mockData";

export default function Page() {
  return (
    <table>
      {mockData.map(item => (
        <tr key={item.id}>{item.name}</tr>
      ))}
    </table>
  );
}

// AFTER
import { useFeature } from "@/hooks/queries";
import { LoadingSpinner, ErrorState } from "@/components/ui/DataStates";

export default function Page() {
  const { data: items = [], isLoading, error } = useFeature();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <table>
      {items.map(item => (
        <tr key={item.id}>{item.name}</tr>
      ))}
    </table>
  );
}
```

## Performance Considerations

- Dashboard queries auto-refetch every 30 seconds for real-time updates
- Other queries cache for 5 minutes before becoming stale
- All queries retry once on failure
- Cache is valid for 10 minutes before being garbage collected

## Notes

- All styling remains unchanged as required
- No UI modifications needed, only data source changes
- Loading/error states use existing design tokens
- Axios client handles JWT token injection automatically
- API errors are caught and displayed user-friendly messages
