import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { AuthActions } from '../actions/auth.actions';
import { User } from '../../auth/models';
import { Router } from '@angular/router';

const STORAGE_KEY = 'subtask.auth';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);

  readonly login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      map(({ username, password }) => {
        if (username.trim().length > 0 && password.length >= 4) {
          const user: User = { username: username.trim(), password };
          return AuthActions.loginSuccess({ user, password });
        }
        return AuthActions.loginFailure({ error: 'Invalid credentials' });
      }),
    ),
  );

  readonly loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, password }) => {
          const stored = { username: user.username, password };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
          this.router.navigate(['/boards']);
        }),
      ),
    { dispatch: false },
  );

  readonly logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem(STORAGE_KEY);
      }),
      map(() => AuthActions.logoutSuccess()),
    ),
  );

  readonly logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  readonly loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      map(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const user = JSON.parse(raw) as User;
            return AuthActions.loadUserSuccess({ user });
          } catch {
            return AuthActions.loadUserSuccess({ user: null });
          }
        }
        return AuthActions.loadUserSuccess({ user: null });
      }),
    ),
  );
}
