import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocalSync } from '../services/local-sync';
import { HeaderBar } from '../ui/header-bar/header-bar';
import { Sidebar } from '../ui/sidebar/sidebar';
import { ShowSidebarButton } from '../ui/sidebar/show-sidebar-button';
import { BoardSelectors, AppState, BoardActions } from '../store';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, ShowSidebarButton, HeaderBar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {
  readonly store: Store<AppState> = inject(Store);
  private readonly router = inject(Router);
  private readonly localSync = inject(LocalSync);

  readonly sidebarHidden = signal(false);

  constructor() {
    this.localSync.init('subtask.sidebarHidden', this.sidebarHidden);
    this.store.dispatch(BoardActions.loadBoards())
  }

  readonly boards = this.store.selectSignal(BoardSelectors.selectAllBoards);
  readonly currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard);

  isAddTaskDisabled(): boolean {
    const board = this.currentBoard();
    return !board || board.columns.length === 0;
  }

  onCreateBoard(): void {
    window.dispatchEvent(new CustomEvent('open:add-board'));
  }

  onAddTask(): void {
    if (this.isAddTaskDisabled()) {
      return;
    }
    const board = this.currentBoard();
    if (board) {
      this.router.navigateByUrl(`/boards/${board.id}/task/new`);
    }
  }
}
