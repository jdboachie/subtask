import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../../../app-state';
import { Button } from '../../../../ui/button/button';

@Component({
  selector: 'app-boards-page',
  imports: [Button],
  templateUrl: './boards.html',
  styleUrl: './boards.css',
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
