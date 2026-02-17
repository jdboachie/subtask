import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Theme } from '../theme';
import { Button } from '../button/button';
import { Modal } from '../modal/modal';
import { Board } from '../board/board.model';
import { BoardsMenu } from '../sidebar/boards-menu/boards-menu';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { AddBoardPage } from '../../features/boards/pages/add-board/add-board';
import { BoardOptions } from '../board-options/board-options';

@Component({
  selector: 'app-header-bar',
  imports: [Button, Modal, BoardsMenu, ThemeToggle, AddBoardPage, BoardOptions],
  templateUrl: './header-bar.html',
  styleUrl: './header-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sidebar-hidden]': 'sidebarHidden()',
  },
})
export class HeaderBar {
  protected readonly theme = inject(Theme);

  readonly boards = input<readonly Board[]>([]);
  readonly boardName = input<string>('');
  readonly sidebarHidden = input(false);
  readonly addTaskDisabled = input(false);

  readonly addTask = output<void>();
  readonly createBoard = output<void>();

  protected readonly logoSrc = computed(() =>
    this.theme.resolvedTheme() === 'dark' ? '/logo-light.svg' : '/logo-dark.svg',
  );

  protected readonly boardListOpen = signal(false);
  protected readonly addBoardOpen = signal(false);

  protected onToggleBoards(): void {
    this.boardListOpen.set(!this.boardListOpen());
  }

  protected onOpenBoards(): void {
    this.boardListOpen.set(true);
  }

  protected onCloseBoards(): void {
    this.boardListOpen.set(false);
  }

  protected onOpenAddBoard(): void {
    this.boardListOpen.set(false);
    this.addBoardOpen.set(true);
  }

  protected onCloseAddBoard(): void {
    this.addBoardOpen.set(false);
  }

  protected readonly _openListener = (() => {
    const handler = () => this.addBoardOpen.set(true);
    window.addEventListener('open:add-board', handler);
    return () => window.removeEventListener('open:add-board', handler);
  })();

  protected readonly _closeListener = (() => {
    const handler = () => this.addBoardOpen.set(false);
    window.addEventListener('close:add-board', handler);
    return () => window.removeEventListener('close:add-board', handler);
  })();
}
