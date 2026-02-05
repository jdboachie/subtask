import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HasUnsavedChanges } from '../../../../auth';
import { AppState } from '../../../../app-state';
import { BoardView } from '../../../../ui/board/board';
import { FilterBar } from '../../../../ui/filter-bar/filter-bar';

@Component({
  selector: 'app-board-details-page',
  imports: [BoardView, FilterBar],
  template: `
    @if (board(); as board) {
      <app-filter-bar
        [columns]="columnNames()"
        [currentFilter]="filter()"
        (filterChange)="onFilterChange($event)"
      />
      <app-board
        [currentBoard]="filteredBoard()"
        (addColumn)="onAddColumn()"
        (taskMoved)="onTaskMoved()"
      />
    } @else if (!isLoading()) {
      <div class="not-found">
        <p>Board not found</p>
      </div>
    }
  `,
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
  private readonly appState = inject(AppState);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  readonly filter = input<string | null>(null);

  protected readonly isLoading = this.appState.isLoading;
  private readonly dirty = signal(false);

  protected readonly board = computed(() => {
    const id = this.id();
    return this.appState.getBoardById(id);
  });

  protected readonly columnNames = computed(() => {
    const board = this.board();
    return board ? board.columns.map((c) => c.name) : [];
  });

  protected readonly filteredBoard = computed(() => {
    const board = this.board();
    const filter = this.filter();
    if (!board || !filter) return board;
    return {
      ...board,
      columns: board.columns.filter((c) => c.name === filter),
    };
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.appState.selectBoardById(id);
        this.dirty.set(false);
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
