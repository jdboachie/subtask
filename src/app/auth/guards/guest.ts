import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthSelectors } from '../../store';

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  const isAuthenticated = store.selectSignal(AuthSelectors.selectIsAuthenticated)();

  if (isAuthenticated) {
    return router.createUrlTree(['/boards']);
  }

  return true;
};
