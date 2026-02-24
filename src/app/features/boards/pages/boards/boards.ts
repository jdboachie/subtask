import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardSelectors } from '../../../../store';
import { BoardActions } from '../../../../store/actions/board.actions';
import { Button } from '../../../../ui/button/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { Board } from '../../../../ui/board/board.model';

@Component({
  selector: 'app-boards-page',
  imports: [Button],
  templateUrl: './boards.html',
  styleUrl: './boards.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsPage {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly boards = toSignal(this.store.select(BoardSelectors.selectAllBoards), {
    initialValue: [] as readonly Board[],
  });

  constructor() {
    console.log("loading boards...")
    this.store.dispatch(BoardActions.loadBoards());

    effect(() => {
      const boards = this.boards();
      if (boards.length > 0) {
        const firstBoard = boards[0];
        this.router.navigate(['/boards', firstBoard.id], { replaceUrl: true });
      }
    });
  }

  protected openAddBoardModal(): void {
    window.dispatchEvent(new CustomEvent('open:add-board'));
  }

  readonly isLoading = this.store.selectSignal(BoardSelectors.selectIsLoading);
}
