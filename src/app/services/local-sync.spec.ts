import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LocalSync } from './local-sync';

describe('LocalSync Service', () => {
  let service: LocalSync;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalSync);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Service Instantiation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be injectable', () => {
      const injected = TestBed.inject(LocalSync);
      expect(injected).toBeInstanceOf(LocalSync);
    });

    it('should be a singleton', () => {
      const a = TestBed.inject(LocalSync);
      const b = TestBed.inject(LocalSync);
      expect(a).toBe(b);
    });
  });

  describe('init - reading from localStorage', () => {
    it('should set signal value from localStorage JSON', () => {
      localStorage.setItem('test-key', JSON.stringify({ count: 42 }));
      const sig = signal<{ count: number } | null>(null);

      TestBed.runInInjectionContext(() => {
        service.init('test-key', sig);
      });

      expect(sig()).toEqual({ count: 42 });
    });

    it('should not change signal when key does not exist', () => {
      const sig = signal<string>('default');

      TestBed.runInInjectionContext(() => {
        service.init('missing-key', sig);
      });

      expect(sig()).toBe('default');
    });

    it('should parse array values from localStorage', () => {
      localStorage.setItem('list-key', JSON.stringify([1, 2, 3]));
      const sig = signal<number[]>([]);

      TestBed.runInInjectionContext(() => {
        service.init('list-key', sig);
      });

      expect(sig()).toEqual([1, 2, 3]);
    });

    it('should parse primitive string values', () => {
      localStorage.setItem('str-key', JSON.stringify('hello'));
      const sig = signal<string>('');

      TestBed.runInInjectionContext(() => {
        service.init('str-key', sig);
      });

      expect(sig()).toBe('hello');
    });

    it('should parse boolean values', () => {
      localStorage.setItem('bool-key', JSON.stringify(true));
      const sig = signal<boolean>(false);

      TestBed.runInInjectionContext(() => {
        service.init('bool-key', sig);
      });

      expect(sig()).toBe(true);
    });

    it('should parse null from localStorage', () => {
      localStorage.setItem('null-key', JSON.stringify(null));
      const sig = signal<string | null>('original');

      TestBed.runInInjectionContext(() => {
        service.init('null-key', sig);
      });

      expect(sig()).toBeNull();
    });
  });

  describe('init - error handling', () => {
    it('should not throw when localStorage value is invalid JSON', () => {
      localStorage.setItem('bad-json', 'not-valid-json{{{');
      const sig = signal<string>('original');

      expect(() => {
        TestBed.runInInjectionContext(() => {
          service.init('bad-json', sig);
        });
      }).not.toThrow();
    });

    it('should preserve signal value when JSON parse fails', () => {
      localStorage.setItem('bad-json', 'invalid');
      const sig = signal<string>('fallback');

      TestBed.runInInjectionContext(() => {
        service.init('bad-json', sig);
      });

      expect(sig()).toBe('fallback');
    });

    it('should log error to console when JSON parse fails', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      localStorage.setItem('bad-json', '{broken');
      const sig = signal<string>('value');

      TestBed.runInInjectionContext(() => {
        service.init('bad-json', sig);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error parsing local storage data');
      consoleSpy.mockRestore();
    });

    it('should handle empty string stored value gracefully', () => {
      localStorage.setItem('empty-key', '');
      const sig = signal<string>('original');

      expect(() => {
        TestBed.runInInjectionContext(() => {
          service.init('empty-key', sig);
        });
      }).not.toThrow();
    });
  });

  describe('init - writing to localStorage via effect', () => {
    it('should write initial signal value to localStorage via effect', () => {
      const sig = signal<string>('initial-value');

      TestBed.runInInjectionContext(() => {
        service.init('write-key', sig);
      });
      TestBed.flushEffects();

      expect(localStorage.getItem('write-key')).toBe(JSON.stringify('initial-value'));
    });

    it('should write object signal value to localStorage', () => {
      const sig = signal<{ name: string }>({ name: 'test' });

      TestBed.runInInjectionContext(() => {
        service.init('obj-key', sig);
      });
      TestBed.flushEffects();

      expect(localStorage.getItem('obj-key')).toBe(JSON.stringify({ name: 'test' }));
    });

    it('should write array signal value to localStorage', () => {
      const sig = signal<number[]>([10, 20, 30]);

      TestBed.runInInjectionContext(() => {
        service.init('arr-key', sig);
      });
      TestBed.flushEffects();

      expect(localStorage.getItem('arr-key')).toBe(JSON.stringify([10, 20, 30]));
    });
  });

  describe('init - isolation between keys', () => {
    it('should read the correct key independently', () => {
      localStorage.setItem('key-a', JSON.stringify('value-a'));
      localStorage.setItem('key-b', JSON.stringify('value-b'));

      const sigA = signal<string>('');
      const sigB = signal<string>('');

      TestBed.runInInjectionContext(() => {
        service.init('key-a', sigA);
        service.init('key-b', sigB);
      });

      expect(sigA()).toBe('value-a');
      expect(sigB()).toBe('value-b');
    });

    it('should not cross-contaminate different keys', () => {
      localStorage.setItem('key-1', JSON.stringify(1));
      const sig1 = signal<number>(0);
      const sig2 = signal<number>(99);

      TestBed.runInInjectionContext(() => {
        service.init('key-1', sig1);
        service.init('key-2', sig2);
      });

      expect(sig1()).toBe(1);
      expect(sig2()).toBe(99);
    });
  });
});
