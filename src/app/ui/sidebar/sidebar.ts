import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Theme } from '../theme';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { SidebarButton } from './sidebar-button';

export interface Board {
  id: string;
  name: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [SidebarButton, ThemeToggle],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-hidden]': 'hidden()',
  },
})
export class Sidebar {
  protected readonly theme = inject(Theme);

  readonly boards = input<Board[]>([]);
  readonly activeBoardId = input<string | null>(null);
  readonly hidden = input(false);

  readonly boardSelect = output<string>();
  readonly createBoard = output<void>();
  readonly hide = output<void>();

  protected readonly boardCount = computed(() => this.boards().length);

  protected readonly logoSrc = computed(() =>
    this.theme.resolvedTheme() === 'dark' ? '/logo-light.svg' : '/logo-dark.svg',
  );
}
