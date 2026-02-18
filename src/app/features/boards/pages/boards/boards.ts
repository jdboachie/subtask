import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../../../app-state';
import { Button } from '../../../../ui/button/button';

@Component({
  selector: 'app-boards-page',
  imports: [Button],
  templateUrl: './boards.html',
  styles: `
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
      font-size: var(--font-size-l);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      height: 100%;
      text-align: center;
      color: var(--text-secondary);
      padding: 2rem;
    }

    .empty-state h2 {
      color: var(--text-primary);
      font-size: var(--font-size-xl);
      margin: 0;
    }

    .empty-state p {
      max-width: 36rem;
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsPage {
  protected readonly appState = inject(AppState);
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

  protected openAddBoardModal(): void {
    window.dispatchEvent(new CustomEvent('open:add-board'));
  }

  protected isLoading(): boolean {
    return this.appState.isLoading();
  }
}
