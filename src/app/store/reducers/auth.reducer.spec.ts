import { authReducer, initialAuthState } from './auth.reducer';
import { AuthActions } from '../actions/auth.actions';
import type { User } from '../../auth/models';

const mockUser: User = { username: 'alice', password: 'password123' };

describe('authReducer', () => {
  describe('Initial State', () => {
    it('should return initial state for unknown action', () => {
      const state = authReducer(undefined, { type: '__unknown__' } as any);
      expect(state).toEqual(initialAuthState);
    });

    it('should have null user initially', () => {
      expect(initialAuthState.user).toBeNull();
    });

    it('should have isLoading false initially', () => {
      expect(initialAuthState.isLoading).toBe(false);
    });

    it('should have null error initially', () => {
      expect(initialAuthState.error).toBeNull();
    });
  });

  describe('AuthActions.login', () => {
    it('should set isLoading to true', () => {
      const state = authReducer(
        initialAuthState,
        AuthActions.login({ username: 'alice', password: 'pass' }),
      );
      expect(state.isLoading).toBe(true);
    });

    it('should clear error', () => {
      const prev = { ...initialAuthState, error: 'previous error' };
      const state = authReducer(prev, AuthActions.login({ username: 'alice', password: 'pass' }));
      expect(state.error).toBeNull();
    });

    it('should not change user', () => {
      const state = authReducer(
        initialAuthState,
        AuthActions.login({ username: 'alice', password: 'pass' }),
      );
      expect(state.user).toBeNull();
    });
  });

  describe('AuthActions.loginSuccess', () => {
    it('should set user', () => {
      const state = authReducer(
        { ...initialAuthState, isLoading: true },
        AuthActions.loginSuccess({ user: mockUser, password: 'password123' }),
      );
      expect(state.user?.username).toBe('alice');
    });

    it('should set password on user', () => {
      const state = authReducer(
        initialAuthState,
        AuthActions.loginSuccess({ user: mockUser, password: 'password123' }),
      );
      expect(state.user?.password).toBe('password123');
    });

    it('should set isLoading to false', () => {
      const state = authReducer(
        { ...initialAuthState, isLoading: true },
        AuthActions.loginSuccess({ user: mockUser, password: 'password123' }),
      );
      expect(state.isLoading).toBe(false);
    });

    it('should clear error', () => {
      const prev = { ...initialAuthState, error: 'old error' };
      const state = authReducer(
        prev,
        AuthActions.loginSuccess({ user: mockUser, password: 'password123' }),
      );
      expect(state.error).toBeNull();
    });
  });

  describe('AuthActions.loginFailure', () => {
    it('should set error message', () => {
      const state = authReducer(
        { ...initialAuthState, isLoading: true },
        AuthActions.loginFailure({ error: 'Invalid credentials' }),
      );
      expect(state.error).toBe('Invalid credentials');
    });

    it('should set isLoading to false', () => {
      const state = authReducer(
        { ...initialAuthState, isLoading: true },
        AuthActions.loginFailure({ error: 'Error' }),
      );
      expect(state.isLoading).toBe(false);
    });

    it('should set user to null', () => {
      const prev = { ...initialAuthState, user: mockUser };
      const state = authReducer(prev, AuthActions.loginFailure({ error: 'Error' }));
      expect(state.user).toBeNull();
    });
  });

  describe('AuthActions.logout', () => {
    it('should set isLoading to true', () => {
      const prev = { ...initialAuthState, user: mockUser };
      const state = authReducer(prev, AuthActions.logout());
      expect(state.isLoading).toBe(true);
    });

    it('should not clear user yet', () => {
      const prev = { ...initialAuthState, user: mockUser };
      const state = authReducer(prev, AuthActions.logout());
      expect(state.user).toBe(mockUser);
    });
  });

  describe('AuthActions.logoutSuccess', () => {
    it('should set user to null', () => {
      const prev = { ...initialAuthState, user: mockUser, isLoading: true };
      const state = authReducer(prev, AuthActions.logoutSuccess());
      expect(state.user).toBeNull();
    });

    it('should set isLoading to false', () => {
      const prev = { ...initialAuthState, user: mockUser, isLoading: true };
      const state = authReducer(prev, AuthActions.logoutSuccess());
      expect(state.isLoading).toBe(false);
    });

    it('should clear error', () => {
      const prev = { ...initialAuthState, error: 'some error' };
      const state = authReducer(prev, AuthActions.logoutSuccess());
      expect(state.error).toBeNull();
    });
  });

  describe('AuthActions.loadUser', () => {
    it('should set isLoading to true', () => {
      const state = authReducer(initialAuthState, AuthActions.loadUser());
      expect(state.isLoading).toBe(true);
    });

    it('should not change user', () => {
      const prev = { ...initialAuthState, user: mockUser };
      const state = authReducer(prev, AuthActions.loadUser());
      expect(state.user).toBe(mockUser);
    });
  });

  describe('AuthActions.loadUserSuccess', () => {
    it('should set user when user provided', () => {
      const prev = { ...initialAuthState, isLoading: true };
      const state = authReducer(prev, AuthActions.loadUserSuccess({ user: mockUser }));
      expect(state.user).toEqual(mockUser);
    });

    it('should set user to null when null provided', () => {
      const prev = { ...initialAuthState, user: mockUser, isLoading: true };
      const state = authReducer(prev, AuthActions.loadUserSuccess({ user: null }));
      expect(state.user).toBeNull();
    });

    it('should set isLoading to false', () => {
      const prev = { ...initialAuthState, isLoading: true };
      const state = authReducer(prev, AuthActions.loadUserSuccess({ user: mockUser }));
      expect(state.isLoading).toBe(false);
    });

    it('should clear error', () => {
      const prev = { ...initialAuthState, error: 'old error' };
      const state = authReducer(prev, AuthActions.loadUserSuccess({ user: mockUser }));
      expect(state.error).toBeNull();
    });
  });

  describe('Immutability', () => {
    it('should return a new state object reference on change', () => {
      const state = authReducer(
        initialAuthState,
        AuthActions.login({ username: 'a', password: 'b' }),
      );
      expect(state).not.toBe(initialAuthState);
    });

    it('should not mutate initial state', () => {
      const snapshot = { ...initialAuthState };
      authReducer(initialAuthState, AuthActions.login({ username: 'a', password: 'b' }));
      expect(initialAuthState).toEqual(snapshot);
    });
  });

  describe('Login / Logout cycle', () => {
    it('should correctly transition from logged-out to logged-in to logged-out', () => {
      let state = authReducer(
        initialAuthState,
        AuthActions.login({ username: 'alice', password: 'pass' }),
      );
      expect(state.isLoading).toBe(true);

      state = authReducer(state, AuthActions.loginSuccess({ user: mockUser, password: 'pass' }));
      expect(state.user?.username).toBe('alice');
      expect(state.isLoading).toBe(false);

      state = authReducer(state, AuthActions.logout());
      expect(state.isLoading).toBe(true);

      state = authReducer(state, AuthActions.logoutSuccess());
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });
});
