import { Role } from '@prisma/client';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  FLEET_MANAGER: [
    'vehicle:view', 'vehicle:create', 'vehicle:update', 'vehicle:delete',
    'driver:view', 'driver:create', 'driver:update', 'driver:delete',
    'trip:view', 'trip:create', 'trip:dispatch', 'trip:approve', 'trip:complete', 'trip:cancel',
    'maintenance:view', 'maintenance:create', 'maintenance:update',
    'expense:view', 'expense:create', 'fuel:view', 'fuel:create',
    'reports:view', 'dashboard:view',
    'users:view', 'users:updateRole',
    'compliance:view', 'compliance:create', 'compliance:update', 'compliance:delete',
    'audit:view'
  ],
  DRIVER: [
    'trip:viewAssigned', 'trip:complete',
    'vehicle:viewAssigned',
    'profile:view', 'profile:update',
    'dashboard:viewOwn',
    'fuel:create'
  ],
  SAFETY_OFFICER: [
    'driver:view', 'driver:update', 'driver:suspend', 'driver:renewLicense',
    'compliance:view', 'compliance:create', 'compliance:update',
    'dashboard:view', 'vehicle:view', 'trip:view'
  ],
  FINANCIAL_ANALYST: [
    'expense:view', 'expense:create',
    'fuel:view',
    'reports:view',
    'dashboard:viewFinance',
    'vehicle:view',
    'trip:view',
    'maintenance:view'
  ],
  ADMIN: [
    'vehicle:view', 'vehicle:create', 'vehicle:update', 'vehicle:delete',
    'driver:view', 'driver:create', 'driver:update', 'driver:delete', 'driver:suspend', 'driver:renewLicense',
    'trip:view', 'trip:create', 'trip:dispatch', 'trip:approve', 'trip:complete', 'trip:cancel',
    'maintenance:view', 'maintenance:create', 'maintenance:update',
    'expense:view', 'expense:create', 'fuel:view', 'fuel:create',
    'reports:view', 'dashboard:view', 'dashboard:viewFinance',
    'users:view', 'users:updateRole',
    'compliance:view', 'compliance:create', 'compliance:update', 'compliance:delete',
    'audit:view'
  ]
};

export function getPermissionsForRole(role: string): string[] {
  return (ROLE_PERMISSIONS as any)[role] || [];
}

export function hasPermission(role: string, permission: string): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}
