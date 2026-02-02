import { computed, Injectable, signal } from '@angular/core';
import { User } from './models';

const STORAGE_KEY = 'kanban_auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly user = signal<User | null>(this.loadUserFromStorage());

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);

  login(username: string, password: string): boolean {
    if (username.trim().length > 0 && password.length >= 4) {
      const user: User = { username: username.trim() };
      this.user.set(user);
      this.saveUserToStorage(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this.user.set(null);
    this.removeUserFromStorage();
  }

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch {
      this.removeUserFromStorage();
    }
    return null;
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
  }

  private removeUserFromStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
