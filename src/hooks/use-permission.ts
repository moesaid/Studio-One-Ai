/**
 * Hook to verify access programmatically.
 * Stub implementation — returns true for all permissions.
 * Replace with real Firebase / backend RBAC logic later.
 */
export function usePermission(permission?: string): boolean {
  // TODO: integrate with auth store / Firebase claims
  return true;
}
