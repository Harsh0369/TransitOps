# Backend Validation & Error Handling Guide

## Overview

This guide explains how to implement backend validation error display, automatic refetching, and proper error handling across all forms in TransitOps.

## Key Features Implemented

✅ **FormError Component** - Display backend validation errors and field-level errors  
✅ **useFormError Hook** - Standardized error handling and extraction  
✅ **Automatic Query Invalidation** - Mutations invalidate related queries  
✅ **Auto-Refetch** - Dashboard KPIs update after actions  
✅ **Logout Functionality** - Already implemented in AuthProvider  
✅ **Role Guards** - Already protecting all pages  
✅ **No UI Redesign** - Uses existing styling system  

## Components & Hooks

### 1. FormError Component
**Location:** `client/components/ui/FormError.tsx`

Displays backend error messages and field-specific errors in a user-friendly format.

```tsx
import { FormError } from "@/components/ui/FormError";

// In your form:
<FormError error={error} fieldErrors={fieldErrors} />
```

**Features:**
- Displays main error message
- Shows field-level validation errors
- Styled with red/error theme
- Automatically hidden when no errors

### 2. useFormError Hook
**Location:** `client/hooks/useFormError.ts`

Handles API error responses and extracts validation errors.

```tsx
const { error, fieldErrors, handleError, clearError, clearFieldError } = useFormError();

// In your mutation error handler:
catch (err) {
  handleError(err);
}
```

**Methods:**
- `handleError(err)` - Process API error and extract validation messages
- `clearError()` - Clear all errors
- `clearFieldError(field)` - Clear specific field error

**Returns:**
- `error` - Main error message (string or null)
- `fieldErrors` - Object with field-specific errors
- `handleError()` - Function to handle errors
- `clearError()` - Clear all errors
- `clearFieldError(field)` - Clear specific field

### 3. Query Invalidation Pattern
**Location:** `client/hooks/queries.ts`

All mutations automatically invalidate related queries:

```tsx
// Example: Creating a trip invalidates trips list and dashboard
export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/trips", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      // Trigger dashboard refresh
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
```

## Implementing in Forms

### Step 1: Import Required Components & Hooks

```tsx
import { FormError } from "@/components/ui/FormError";
import { useFormError } from "@/hooks/useFormError";
import { useYourMutation } from "@/hooks/queries";
```

### Step 2: Initialize Error Handling

```tsx
export default function YourForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, fieldErrors, handleError, clearError } = useFormError();
  const mutation = useYourMutation();
  
  // ... rest of component
}
```

### Step 3: Add Error Display

```tsx
{/* Display errors at top of form */}
<FormError error={error} fieldErrors={fieldErrors} />

{/* Optional: Success message */}
{successMessage && (
  <div className="p-3 rounded-lg border border-green-500/20 bg-green-950/40">
    <p className="text-sm text-green-200">{successMessage}</p>
  </div>
)}
```

### Step 4: Add Error Highlighting to Inputs

```tsx
<input
  value={value}
  onChange={(e) => onChange(e.target.value)}
  disabled={isSubmitting}
  className="w-full rounded-lg p-2.5 text-sm border transition-all focus:outline-none disabled:opacity-50"
  style={{
    backgroundColor: "var(--color-surface)",
    // Highlight field if it has an error
    borderColor: fieldErrors.fieldName ? "var(--color-error)" : "var(--color-outline-variant)",
    color: "var(--color-on-surface)",
  }}
/>
```

### Step 5: Handle Form Submission

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  clearError(); // Clear previous errors
  
  // Validate required fields locally
  if (!requiredField) {
    handleError(new Error("Please fill all required fields"));
    return;
  }
  
  setIsSubmitting(true);
  try {
    await mutation.mutateAsync({
      field1: value1,
      field2: value2,
    });
    
    setSuccessMessage("Action completed successfully!");
    // Reset form
    resetFormFields();
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (err) {
    handleError(err); // Extracts backend validation errors
  } finally {
    setIsSubmitting(false);
  }
};
```

### Step 6: Update Button State During Submission

```tsx
<button
  type="submit"
  disabled={isSubmitting || formHasErrors}
  className={clsx(
    "flex items-center justify-center gap-2 transition-all",
    isSubmitting ? "opacity-50" : "hover:opacity-90"
  )}
>
  {isSubmitting ? (
    <>
      <Loader className="w-4 h-4 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      <Icon className="w-4 h-4" />
      Submit
    </>
  )}
</button>
```

## Backend Error Response Format

The error handling expects backend responses in this format:

### Error Response (HTTP 400-500)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": "Error message for this field",
    "another_field": "Another error"
  }
}
```

### Success Response
```json
{
  "success": true,
  "data": { /* your data */ }
}
```

## Validation Error Examples

The system handles all standard validation errors:

- **Duplicate Registration** - "Email already exists"
- **Vehicle In Shop** - "Vehicle is currently in shop for maintenance"
- **Vehicle Retired** - "Cannot use retired vehicle"
- **Driver Suspended** - "Driver account is currently suspended"
- **License Expired** - "Driver license has expired"
- **Cargo Capacity Exceeded** - "Cargo weight exceeds vehicle capacity"
- **Vehicle Already On Trip** - "Vehicle is already assigned to an active trip"
- **Driver Already On Trip** - "Driver is already assigned to an active trip"

## Automatic Query Refetching

After successful mutations, related data automatically refreshes:

| Mutation | Invalidates |
|----------|------------|
| Create/Update Vehicle | `["vehicles"]`, `["dashboard"]` |
| Create/Update Driver | `["drivers"]`, `["dashboard"]` |
| Create/Update Trip | `["trips"]`, `["dashboard"]` |
| Create Maintenance | `["maintenance"]`, `["vehicles"]`, `["dashboard"]` |
| Create Fuel Log | `["fuel"]`, `["dashboard"]` |
| Create Expense | `["expenses"]`, `["dashboard"]` |

## Authentication & Authorization

### Logout
Already implemented in `AuthProvider`:
```tsx
const { logout } = useAuth();

// Logout button in TopNavbar
<button onClick={logout}>Logout</button>
```

### Role Guards
Already protecting all pages:
```tsx
<RoleGuard allowedRoles={["Fleet Manager", "Dispatcher"]}>
  {/* Protected content */}
</RoleGuard>
```

**Roles:**
- Fleet Manager - Full access to all dashboards
- Dispatcher - Manage trips
- Safety Officer - Driver management
- Financial Analyst - Analytics and reports

## Testing Error Scenarios

### Test 1: Duplicate Registration
1. Try to register same email twice
2. Backend returns `{ message: "Email already exists" }`
3. Error displays in FormError component

### Test 2: Validation Error
1. Submit form with invalid data
2. Backend returns field errors
3. Fields highlight in red
4. Errors show above form

### Test 3: Success and Refetch
1. Submit valid form
2. See success message
3. Related query data automatically refetches
4. Form clears and resets

### Test 4: Unauthorized Access
1. Try accessing role-restricted page without permission
2. Redirected to dashboard with access denied
3. Console shows 403 error

### Test 5: Token Expiration
1. Wait for token to expire
2. Make any API call
3. Automatically redirected to login
4. Token cleared from localStorage

## Common Patterns

### Pattern 1: Form with Multiple Validation Errors
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  clearError();
  
  // Local validation
  const errors: Record<string, string> = {};
  if (!email) errors.email = "Email required";
  if (!password || password.length < 6) errors.password = "Password must be 6+ chars";
  
  if (Object.keys(errors).length > 0) {
    // Display local validation errors
    return;
  }
  
  // Try API
  try {
    await mutation.mutateAsync({ email, password });
  } catch (err) {
    handleError(err); // Shows backend errors
  }
};
```

### Pattern 2: Conditional Field Validation
```tsx
<input
  style={{
    borderColor: 
      fieldErrors.cargoWeight ? "var(--color-error)" :
      cargoWeight > capacity ? "var(--color-warning)" :
      "var(--color-outline-variant)"
  }}
/>
{cargoWeight > capacity && (
  <p className="text-sm text-warning">Exceeds capacity by {cargoWeight - capacity}kg</p>
)}
```

### Pattern 3: Dependent Field Updates
```tsx
useEffect(() => {
  clearFieldError("destination"); // Clear when source changes
}, [source]);
```

## Migration Checklist

To add error handling to an existing form:

- [ ] Import FormError and useFormError
- [ ] Add `error`, `fieldErrors`, `handleError` state
- [ ] Add FormError display component
- [ ] Add error highlighting to input borders
- [ ] Wrap mutation in try/catch with handleError
- [ ] Add isSubmitting state to buttons
- [ ] Test validation error scenarios
- [ ] Test success flow with data refresh
- [ ] Test error scenarios (network, validation, auth)

## Support

For issues or questions:
1. Check the Trips page implementation (`app/(dashboard)/trips/page.tsx`) for a complete example
2. Review the DataStates component for loading/error states
3. Check API interceptors in `lib/axios.ts` for auth handling
