import { Injectable, WritableSignal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalSync {
  init<T>(storageKey: string, target: WritableSignal<T>) {
    const raw = localStorage.getItem(storageKey);

    try {
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        target.set(parsed);
      }
    } catch {
      console.log('Error parsing local storage data');
    }

    effect(() => {
      const value = target();
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
  }
}
