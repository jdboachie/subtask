import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppState } from '../app-state';
import { LocalSync } from '../services/local-sync';
import { HeaderBar } from '../ui/header-bar/header-bar';
import { Sidebar } from '../ui/sidebar/sidebar';
import { ShowSidebarButton } from '../ui/sidebar/show-sidebar-button';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, ShowSidebarButton, HeaderBar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {
  protected appState = inject(AppState);
  private readonly router = inject(Router);
  private readonly localSync = inject(LocalSync);

  protected readonly sidebarHidden = signal(false);

  constructor() {
    this.localSync.init('subtask.sidebarHidden', this.sidebarHidden);
    this.localSync.sync('subtask.sidebarHidden', this.sidebarHidden);
  }

  protected readonly addTaskDisabled = computed(() => {
    const board = this.appState.currentBoard();
    return !board || board.columns.length === 0;
  });

  protected onCreateBoard(): void {
    window.dispatchEvent(new CustomEvent('open:add-board'));
  }

  protected onAddTask(): void {
    if (this.addTaskDisabled()) {
      return;
    }
    this.router.navigateByUrl(`/boards/${this.appState.currentBoard()!.id}/task/new`);
  }
}
