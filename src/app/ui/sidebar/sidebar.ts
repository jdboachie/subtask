import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Board } from '../board/board.model';
import { Theme } from '../theme';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { SidebarButton } from './sidebar-button';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, SidebarButton, ThemeToggle],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-hidden]': 'hidden()',
  },
})
export class Sidebar {
  protected readonly theme = inject(Theme);

  readonly boards = input<readonly Board[]>([]);
  readonly hidden = input(false);

  readonly createBoard = output<void>();
  readonly hide = output<void>();

  protected readonly boardCount = computed(() => this.boards().length);
}
