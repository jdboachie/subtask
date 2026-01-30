import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Theme } from '../theme';
import { Button } from '../button/button';

@Component({
  selector: 'app-header-bar',
  imports: [Button],
  templateUrl: './header-bar.html',
  styleUrl: './header-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sidebar-hidden]': 'sidebarHidden()',
  },
})
export class HeaderBar {
  protected readonly theme = inject(Theme);

  readonly boardName = input<string>('');
  readonly sidebarHidden = input(false);
  readonly addTaskDisabled = input(false);

  readonly addTask = output<void>();

  protected readonly logoSrc = computed(() =>
    this.theme.resolvedTheme() === 'dark' ? '/logo-light.svg' : '/logo-dark.svg',
  );
}
