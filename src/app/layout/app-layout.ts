import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppState } from '../app-state';
import { HeaderBar } from '../ui/header-bar/header-bar';
import { Sidebar } from '../ui/sidebar/sidebar';
import { ShowSidebarButton } from '../ui/sidebar/show-sidebar-button';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, ShowSidebarButton, HeaderBar],
  template: `
    <app-sidebar
      [boards]="appState.boards()"
      [hidden]="sidebarHidden()"
      (createBoard)="onCreateBoard()"
      (hide)="sidebarHidden.set(true)"
    />

    @if (sidebarHidden()) {
      <button
        app-show-sidebar-button
        (click)="sidebarHidden.set(false)"
        aria-label="Show sidebar"
      ></button>
    }

    <div class="main-content" [class.sidebar-visible]="!sidebarHidden()">
      <app-header-bar
        [boardName]="appState.currentBoard()?.name ?? ''"
        [sidebarHidden]="sidebarHidden()"
        [addTaskDisabled]="addTaskDisabled()"
        (addTask)="onAddTask()"
      />

      <main class="board-area">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {
  protected readonly appState = inject(AppState);

  protected readonly sidebarHidden = signal(false);

  protected readonly addTaskDisabled = computed(() => {
    const board = this.appState.currentBoard();
    return !board || board.columns.length === 0;
  });

  protected onCreateBoard(): void {
    console.log('Create new board');
  }

  protected onAddTask(): void {
    console.log('Add new task');
  }
}
