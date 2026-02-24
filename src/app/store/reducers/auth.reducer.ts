import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '../actions/auth.actions';
import { User } from '../../auth/models';

export interface AuthState {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user, password }) => ({
    ...state,
    user: { ...user, password },
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    isLoading: false,
    error,
  })),

  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    user: null,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loadUser, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null,
  })),
);
