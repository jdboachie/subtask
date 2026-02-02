import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../app-state';

@Component({
  selector: 'app-boards-page',
  template: `
    <div class="loading">
      <p>Loading boards...</p>
    </div>
  `,
  styles: `
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
      font-size: var(--font-size-l);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsPage {
  private readonly appState = inject(AppState);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const boards = this.appState.boards();
      if (boards.length > 0) {
        const firstBoard = boards[0];
        this.router.navigate(['/boards', firstBoard.id], { replaceUrl: true });
      }
    });
  }
}
