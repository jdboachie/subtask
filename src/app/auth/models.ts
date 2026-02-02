export interface User {
  readonly username: string;
}

export interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
}
