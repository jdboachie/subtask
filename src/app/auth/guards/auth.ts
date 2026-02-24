import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions, AuthSelectors } from '../../store';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  store.dispatch(AuthActions.loadUser());

  return store.select(AuthSelectors.selectIsAuthenticated).pipe(
    take(1),
    map((isAuth) => (isAuth ? true : router.createUrlTree(['/login']))),
  );
};
