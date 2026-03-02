import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';

const STORAGE_KEY = 'kanban_auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Service Instantiation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be a singleton', () => {
      const a = TestBed.inject(AuthService);
      const b = TestBed.inject(AuthService);
      expect(a).toBe(b);
    });
  });

  describe('Initial state', () => {
    it('should have null currentUser when no stored user', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should have isAuthenticated false when no stored user', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should load user from localStorage on creation', () => {
      const stored = { username: 'alice', password: 'pass1234' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const freshService = TestBed.inject(AuthService);

      expect(freshService.currentUser()?.username).toBe('alice');
    });

    it('should be authenticated when stored user exists', () => {
      const stored = { username: 'bob', password: 'secret99' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const freshService = TestBed.inject(AuthService);

      expect(freshService.isAuthenticated()).toBe(true);
    });
  });

  describe('login()', () => {
    it('should return true for valid credentials', () => {
      const result = service.login('alice', 'password123');
      expect(result).toBe(true);
    });

    it('should return false for empty username', () => {
      const result = service.login('', 'password123');
      expect(result).toBe(false);
    });

    it('should return false for whitespace-only username', () => {
      const result = service.login('   ', 'password123');
      expect(result).toBe(false);
    });

    it('should return false for password shorter than 4 characters', () => {
      const result = service.login('alice', 'abc');
      expect(result).toBe(false);
    });

    it('should return false for password of exactly 3 characters', () => {
      const result = service.login('alice', '123');
      expect(result).toBe(false);
    });

    it('should return true for password of exactly 4 characters', () => {
      const result = service.login('alice', '1234');
      expect(result).toBe(true);
    });

    it('should set currentUser after successful login', () => {
      service.login('alice', 'password123');
      expect(service.currentUser()?.username).toBe('alice');
    });

    it('should trim whitespace from username', () => {
      service.login('  bob  ', 'password123');
      expect(service.currentUser()?.username).toBe('bob');
    });

    it('should set isAuthenticated to true after successful login', () => {
      service.login('alice', 'password123');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should not change user on failed login attempt', () => {
      expect(service.currentUser()).toBeNull();
      service.login('', 'password');
      expect(service.currentUser()).toBeNull();
    });

    it('should not set isAuthenticated on failed login', () => {
      service.login('', 'password');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should save user to localStorage on successful login', () => {
      service.login('charlie', 'securepass');
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      expect(stored.username).toBe('charlie');
    });

    it('should not save to localStorage on failed login', () => {
      service.login('', 'pass');
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should overwrite previous user on second login', () => {
      service.login('alice', 'pass1234');
      service.login('bob', 'mypassword');
      expect(service.currentUser()?.username).toBe('bob');
    });
  });

  describe('logout()', () => {
    beforeEach(() => {
      service.login('alice', 'password123');
    });

    it('should set currentUser to null', () => {
      service.logout();
      expect(service.currentUser()).toBeNull();
    });

    it('should set isAuthenticated to false', () => {
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should remove user from localStorage', () => {
      service.logout();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should not throw when called without a login', () => {
      service.logout();
      expect(() => service.logout()).not.toThrow();
    });

    it('should clear user regardless of who is logged in', () => {
      service.login('bob', 'securepassword');
      service.logout();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('isAuthenticated (computed)', () => {
    it('should be false before login', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should be true after login', () => {
      service.login('user', 'password1234');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should be false after logout', () => {
      service.login('user', 'password1234');
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('currentUser (readonly signal)', () => {
    it('should expose username after login', () => {
      service.login('diana', 'strongpass');
      expect(service.currentUser()?.username).toBe('diana');
    });

    it('should not expose mutated reference after login', () => {
      service.login('diana', 'strongpass');
      const userRef = service.currentUser();
      service.login('eve', 'anotherpass');
      expect(userRef?.username).toBe('diana');
    });
  });

  describe('loadUserFromStorage - error handling', () => {
    it('should handle corrupt JSON in localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, '{corrupt json');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      expect(() => TestBed.inject(AuthService)).not.toThrow();
    });

    it('should return null when localStorage JSON is corrupt', () => {
      localStorage.setItem(STORAGE_KEY, '{corrupt');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const freshService = TestBed.inject(AuthService);

      expect(freshService.currentUser()).toBeNull();
    });

    it('should remove corrupt entry from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, '{corrupt');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      TestBed.inject(AuthService);

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
