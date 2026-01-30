import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';
import { Theme } from '../theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [NgpSwitch, NgpSwitchThumb],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly theme = inject(Theme);

  protected readonly isDarkMode = computed(() => this.theme.resolvedTheme() === 'dark');

  protected onToggle(checked: boolean): void {
    this.theme.setPreference(checked ? 'dark' : 'light');
  }
}
