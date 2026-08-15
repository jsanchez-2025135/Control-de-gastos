import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional (Angular 15+/17+).
 * Uso en rutas:
 *   { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 *   { path: 'admin', component: AdminComponent, canActivate: [authGuard], data: { role: 'admin' } }
 *
 * - Si no hay sesión -> redirige a /login.
 * - Si la ruta pide un rol específico (data.role) y no coincide -> redirige a /dashboard.
 */
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'];
  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
