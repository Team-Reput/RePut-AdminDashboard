// guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role-based route guard.
 * Reads allowed roles from route data: { roles: ['admin', 'sales'] }
 * If no roles specified, allows any authenticated user.
 * Redirects unauthorized roles to /admin/overview.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Check authentication first
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Read allowed roles from route data
  const allowedRoles: string[] = route.data?.['roles'] || [];

  // If no roles specified, allow any authenticated user
  if (allowedRoles.length === 0) {
    return true;
  }

  const userRole = auth.getUserRole();

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect unauthorized roles to overview (a safe default)
  router.navigate(['/admin/overview']);
  return false;
};
