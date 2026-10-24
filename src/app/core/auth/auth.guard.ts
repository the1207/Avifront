import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/api.models';
import { AuthService } from './auth.service';

/** Sans argument : exige seulement d'etre connecte. Avec des roles : exige l'un d'eux. */
export const authGuard = (roles?: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/signin']);
  if (roles && !auth.hasRole(...roles)) return router.createUrlTree(['/']);
  return true;
};
