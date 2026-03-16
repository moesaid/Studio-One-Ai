'use client';

import { usePermission } from '@/hooks/use-permission';

interface PermissionGuardProps {
  permission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps UI elements that require specific roles / permissions.
 * Stub implementation — always renders children.
 * Integrate with real RBAC once auth is wired up.
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
