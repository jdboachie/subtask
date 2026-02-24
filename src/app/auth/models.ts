export interface User {
  readonly username: string;
  readonly password: string;
}

export interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
}
