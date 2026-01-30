import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './ui/theme';
import { ThemeToggle } from './ui/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly theme = inject(Theme);
  protected readonly title = signal('subtask');
}
