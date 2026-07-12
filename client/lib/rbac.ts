import { Role } from "@/types/auth";

export const ROLE_PERMISSIONS = {
  "Fleet Manager": [
    "vehicles:read",
    "vehicles:create",
    "vehicles:update",
    "vehicles:delete",
    "drivers:read",
    "drivers:create",
    "drivers:update",
    "drivers:delete",
    "trips:read",
    "trips:create",
    "trips:dispatch",
    "trips:complete",
    "trips:cancel",
    "maintenance:read",
    "maintenance:create",
    "maintenance:resolve",
    "fuel:read",
    "fuel:create",
    "expenses:read",
    "expenses:create",
    "expenses:update",
    "expenses:delete",
    "analytics:read",
    "reports:read"
  ],
  "Dispatcher": [
    "vehicles:read",
    "drivers:read",
    "trips:read",
    "trips:create",
    "trips:dispatch",
    "trips:complete",
    "trips:cancel"
  ],
  "Safety Officer": [
    "drivers:read",
    "drivers:updateSafetyScore",
    "drivers:suspend"
  ],
  "Financial Analyst": [
    "fuel:read",
    "fuel:create",
    "expenses:read",
    "expenses:create",
    "expenses:update",
    "expenses:delete",
    "analytics:read",
    "reports:read"
  ]
};

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
