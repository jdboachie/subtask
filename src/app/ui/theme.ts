import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  readonly preference = signal<ThemePreference>(this.loadPreference());
  readonly systemPrefersDark = signal(this.mediaQuery.matches);

  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const pref = this.preference();
    if (pref === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return pref;
  });

  constructor() {
    this.mediaQuery.addEventListener('change', (e) => {
      this.systemPrefersDark.set(e.matches);
    });

    effect(() => {
      this.applyTheme(this.resolvedTheme());
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    localStorage.setItem(STORAGE_KEY, preference);
  }

  toggle(): void {
    const next = this.resolvedTheme() === 'dark' ? 'light' : 'dark';
    this.setPreference(next);
  }

  private loadPreference(): ThemePreference {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  private applyTheme(theme: ResolvedTheme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
