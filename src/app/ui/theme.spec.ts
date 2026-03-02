import { TestBed } from '@angular/core/testing';
import { Theme } from './theme';

const STORAGE_KEY = 'theme-preference';

describe('Theme Service', () => {
  let service: Theme;

  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }),
    });
    TestBed.configureTestingModule({});
    service = TestBed.inject(Theme);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Service Instantiation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be a singleton', () => {
      const a = TestBed.inject(Theme);
      const b = TestBed.inject(Theme);
      expect(a).toBe(b);
    });
  });

  describe('Initial preference', () => {
    it('should default preference to system when no storage entry', () => {
      expect(service.preference()).toBe('system');
    });

    it('should load light preference from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const fresh = TestBed.inject(Theme);
      expect(fresh.preference()).toBe('light');
    });

    it('should load dark preference from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const fresh = TestBed.inject(Theme);
      expect(fresh.preference()).toBe('dark');
    });

    it('should load system preference from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'system');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const fresh = TestBed.inject(Theme);
      expect(fresh.preference()).toBe('system');
    });

    it('should fallback to system when stored value is invalid', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-theme');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const fresh = TestBed.inject(Theme);
      expect(fresh.preference()).toBe('system');
    });
  });

  describe('setPreference()', () => {
    it('should update preference signal to light', () => {
      service.setPreference('light');
      expect(service.preference()).toBe('light');
    });

    it('should update preference signal to dark', () => {
      service.setPreference('dark');
      expect(service.preference()).toBe('dark');
    });

    it('should update preference signal to system', () => {
      service.setPreference('light');
      service.setPreference('system');
      expect(service.preference()).toBe('system');
    });

    it('should persist light preference to localStorage', () => {
      service.setPreference('light');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    });

    it('should persist dark preference to localStorage', () => {
      service.setPreference('dark');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('should persist system preference to localStorage', () => {
      service.setPreference('system');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
    });

    it('should overwrite previous preference in localStorage', () => {
      service.setPreference('light');
      service.setPreference('dark');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });
  });

  describe('resolvedTheme (computed)', () => {
    it('should resolve to light when preference is light', () => {
      service.setPreference('light');
      expect(service.resolvedTheme()).toBe('light');
    });

    it('should resolve to dark when preference is dark', () => {
      service.setPreference('dark');
      expect(service.resolvedTheme()).toBe('dark');
    });

    it('should resolve to light when preference is system and system is light', () => {
      service.systemPrefersDark.set(false);
      service.setPreference('system');
      expect(service.resolvedTheme()).toBe('light');
    });

    it('should resolve to dark when preference is system and system is dark', () => {
      service.systemPrefersDark.set(true);
      service.setPreference('system');
      expect(service.resolvedTheme()).toBe('dark');
    });

    it('should update when systemPrefersDark changes in system mode', () => {
      service.setPreference('system');
      service.systemPrefersDark.set(false);
      expect(service.resolvedTheme()).toBe('light');
      service.systemPrefersDark.set(true);
      expect(service.resolvedTheme()).toBe('dark');
    });

    it('should not react to systemPrefersDark when preference is explicit light', () => {
      service.setPreference('light');
      service.systemPrefersDark.set(true);
      expect(service.resolvedTheme()).toBe('light');
    });

    it('should not react to systemPrefersDark when preference is explicit dark', () => {
      service.setPreference('dark');
      service.systemPrefersDark.set(false);
      expect(service.resolvedTheme()).toBe('dark');
    });
  });

  describe('toggle()', () => {
    it('should toggle from light to dark', () => {
      service.setPreference('light');
      service.toggle();
      expect(service.preference()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      service.setPreference('dark');
      service.toggle();
      expect(service.preference()).toBe('light');
    });

    it('should toggle from system-dark to light', () => {
      service.setPreference('system');
      service.systemPrefersDark.set(true);
      service.toggle();
      expect(service.preference()).toBe('light');
    });

    it('should toggle from system-light to dark', () => {
      service.setPreference('system');
      service.systemPrefersDark.set(false);
      service.toggle();
      expect(service.preference()).toBe('dark');
    });

    it('should persist toggled preference to localStorage', () => {
      service.setPreference('light');
      service.toggle();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('should update resolvedTheme after toggle', () => {
      service.setPreference('light');
      expect(service.resolvedTheme()).toBe('light');
      service.toggle();
      expect(service.resolvedTheme()).toBe('dark');
    });

    it('should be idempotent over two toggles', () => {
      service.setPreference('light');
      service.toggle();
      service.toggle();
      expect(service.preference()).toBe('light');
    });
  });
});
