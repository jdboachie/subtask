import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button } from './ui/button/button';
import { Board, Sidebar } from './ui/sidebar/sidebar';
import { ShowSidebarButton } from './ui/sidebar/show-sidebar-button';
import { Theme } from './ui/theme';
import { ThemeToggle } from './ui/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, Button, Sidebar, ShowSidebarButton],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly theme = inject(Theme);
  protected readonly title = signal('subtask');

  protected readonly sidebarHidden = signal(false);
  protected readonly activeBoardId = signal<string | null>('1');

  protected readonly boards = signal<Board[]>([
    { id: '1', name: 'Platform Launch' },
    { id: '2', name: 'Marketing Plan' },
    { id: '3', name: 'Roadmap' },
  ]);

  protected hideSidebar(): void {
    this.sidebarHidden.set(true);
  }

  protected showSidebar(): void {
    this.sidebarHidden.set(false);
  }

  protected selectBoard(id: string): void {
    this.activeBoardId.set(id);
  }

  protected onCreateBoard(): void {
    console.log('Create new board');
  }
}
