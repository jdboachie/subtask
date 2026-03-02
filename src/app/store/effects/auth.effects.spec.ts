import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AuthEffects } from './auth.effects';
import { AuthActions } from '../actions/auth.actions';
import { User } from '../../auth/models';

const STORAGE_KEY = 'subtask.auth';

describe('AuthEffects', () => {
  let effects: AuthEffects;
  let actions$: ReplaySubject<any>;
  let router: { navigate: jest.Mock };

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    router = { navigate: jest.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: Router, useValue: router },
      ],
    });

    effects = TestBed.inject(AuthEffects);
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login$', () => {
    it('dispatches loginSuccess for valid credentials', async () => {
      const user: User = { username: 'john', password: 'pass1234' };
      actions$.next(AuthActions.login({ username: 'john', password: 'pass1234' }));

      const action = await firstValueFrom(effects.login$);

      expect(action).toEqual(AuthActions.loginSuccess({ user, password: 'pass1234' }));
    });

    it('trims username before creating the user object', async () => {
      const user: User = { username: 'john', password: 'pass1234' };
      actions$.next(AuthActions.login({ username: '  john  ', password: 'pass1234' }));

      const action = await firstValueFrom(effects.login$);

      expect(action).toEqual(AuthActions.loginSuccess({ user, password: 'pass1234' }));
    });

    it('dispatches loginFailure when password is shorter than 4 characters', async () => {
      actions$.next(AuthActions.login({ username: 'john', password: 'pas' }));

      const action = await firstValueFrom(effects.login$);

      expect(action).toEqual(AuthActions.loginFailure({ error: 'Invalid credentials' }));
    });

    it('dispatches loginFailure when password is exactly 3 characters', async () => {
      actions$.next(AuthActions.login({ username: 'john', password: 'abc' }));

      const action = await firstValueFrom(effects.login$);

      expect(action).toEqual(AuthActions.loginFailure({ error: 'Invalid credentials' }));
    });

    it('dispatches loginFailure when username is blank', async () => {
      actions$.next(AuthActions.login({ username: '   ', password: 'pass1234' }));

      const action = await firstValueFrom(effects.login$);

      expect(action).toEqual(AuthActions.loginFailure({ error: 'Invalid credentials' }));
    });

    it('dispatches loginFailure when username is empty string', async () => {
      actions$.next(AuthActions.login({ username: '', password: 'pass1234' }));

      const action = await firstValueFrom(effects.login$);

      expect(action).toEqual(AuthActions.loginFailure({ error: 'Invalid credentials' }));
    });

    it('accepts password exactly 4 characters long', async () => {
      actions$.next(AuthActions.login({ username: 'john', password: 'pass' }));

      const action = await firstValueFrom(effects.login$);

      expect(action.type).toBe('[Auth] Login Success');
    });
  });

  describe('loginSuccess$', () => {
    const user: User = { username: 'john', password: 'pass1234' };

    it('stores credentials in localStorage', async () => {
      actions$.next(AuthActions.loginSuccess({ user, password: 'pass1234' }));

      await firstValueFrom(effects.loginSuccess$);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual({ username: 'john', password: 'pass1234' });
    });

    it('navigates to /boards after login', async () => {
      actions$.next(AuthActions.loginSuccess({ user, password: 'pass1234' }));

      await firstValueFrom(effects.loginSuccess$);

      expect(router.navigate).toHaveBeenCalledWith(['/boards']);
    });

    it('navigates to /boards exactly once', async () => {
      actions$.next(AuthActions.loginSuccess({ user, password: 'pass1234' }));

      await firstValueFrom(effects.loginSuccess$);

      expect(router.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout$', () => {
    it('removes auth data from localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: 'john', password: 'pass' }));

      actions$.next(AuthActions.logout());

      await firstValueFrom(effects.logout$);

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('dispatches logoutSuccess', async () => {
      actions$.next(AuthActions.logout());

      const action = await firstValueFrom(effects.logout$);

      expect(action).toEqual(AuthActions.logoutSuccess());
    });

    it('does not throw when localStorage has no auth data', async () => {
      actions$.next(AuthActions.logout());

      await expect(firstValueFrom(effects.logout$)).resolves.toBeDefined();
    });
  });

  describe('logoutSuccess$', () => {
    it('navigates to /login', async () => {
      actions$.next(AuthActions.logoutSuccess());

      await firstValueFrom(effects.logoutSuccess$);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('navigates to /login exactly once', async () => {
      actions$.next(AuthActions.logoutSuccess());

      await firstValueFrom(effects.logoutSuccess$);

      expect(router.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadUser$', () => {
    it('dispatches loadUserSuccess with user from localStorage', async () => {
      const user: User = { username: 'john', password: 'pass1234' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      actions$.next(AuthActions.loadUser());

      const action = await firstValueFrom(effects.loadUser$);

      expect(action).toEqual(AuthActions.loadUserSuccess({ user }));
    });

    it('dispatches loadUserSuccess with null when localStorage is empty', async () => {
      actions$.next(AuthActions.loadUser());

      const action = await firstValueFrom(effects.loadUser$);

      expect(action).toEqual(AuthActions.loadUserSuccess({ user: null }));
    });

    it('dispatches loadUserSuccess with null when JSON is corrupted', async () => {
      localStorage.setItem(STORAGE_KEY, 'THIS_IS_NOT_JSON{{');

      actions$.next(AuthActions.loadUser());

      const action = await firstValueFrom(effects.loadUser$);

      expect(action).toEqual(AuthActions.loadUserSuccess({ user: null }));
    });

    it('dispatches loadUserSuccess with null when value is null string', async () => {
      localStorage.setItem(STORAGE_KEY, 'null');

      actions$.next(AuthActions.loadUser());

      const action = await firstValueFrom(effects.loadUser$);

      expect(action).toEqual(AuthActions.loadUserSuccess({ user: null }));
    });
  });
});
