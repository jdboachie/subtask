import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HasUnsavedChanges } from '../../../../auth';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BoardView } from '../../../../ui/board/board';
import { FilterBar } from '../../../../ui/filter-bar/filter-bar';

@Component({
  selector: 'app-board-details-page',
  imports: [BoardView, FilterBar, RouterOutlet],
  templateUrl: './board-details.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .not-found {
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
export class BoardDetailsPage implements HasUnsavedChanges {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  readonly filter = input<string | null>(null);

  protected readonly isLoading = toSignal(this.store.select(BoardSelectors.selectIsLoading), {
    initialValue: true,
  });
  private readonly dirty = signal(false);

  protected readonly board = signal<import('../../../../ui/board/board.model').Board | null>(null);

  protected readonly columnNames = toSignal(this.store.select(BoardSelectors.selectColumnNames), {
    initialValue: [],
  });

  protected readonly filteredBoard = toSignal(
    this.store.select(BoardSelectors.selectCurrentBoard).pipe(
      map((board) => {
        const filter = this.filter();
        if (!board || !filter) return board;
        return {
          ...board,
          columns: board.columns.filter((c) => c.name === filter),
        };
      }),
    ),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(BoardActions.selectBoardById({ id }));
        const sel = BoardSelectors.selectBoardById(id);
        const b = this.store.selectSignal(sel)();
        this.board.set(b);
        this.dirty.set(false);
      } else {
        this.board.set(null);
      }
    });
  }

  hasUnsavedChanges(): boolean {
    return this.dirty();
  }

  protected onAddColumn(): void {
    console.log('Add new column');
    this.dirty.set(true);
  }

  protected onTaskMoved(): void {
    this.dirty.set(true);
  }

  protected onFilterChange(filter: string | null): void {
    this.router.navigate([], {
      queryParams: { filter },
      queryParamsHandling: filter ? 'merge' : null,
    });
  }
}
