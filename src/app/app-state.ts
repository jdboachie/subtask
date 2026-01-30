import { computed, Injectable, resource, signal } from '@angular/core';
import { BoardData } from './board/board.model';

@Injectable({
  providedIn: 'root',
})
export class AppState {
  private readonly boardsResource = resource({
    loader: async () => {
      const response = await fetch('/data.json');
      const data: BoardData = await response.json();
      return data.boards;
    },
  });

  readonly isLoading = this.boardsResource.isLoading;

  readonly boards = computed(() => this.boardsResource.value() ?? []);
  readonly boardCount = computed(() => this.boards().length);

  private readonly selectedBoardIndex = signal<number>(0);

  readonly currentBoard = computed(() => {
    const boards = this.boards();
    const index = this.selectedBoardIndex();
    return boards[index] ?? null;
  });

  readonly currentBoardIndex = this.selectedBoardIndex.asReadonly();

  selectBoard(index: number): void {
    const boards = this.boards();
    if (index >= 0 && index < boards.length) {
      this.selectedBoardIndex.set(index);
    }
  }

  selectBoardByName(name: string): void {
    const index = this.boards().findIndex((board) => board.name === name);
    if (index !== -1) {
      this.selectedBoardIndex.set(index);
    }
  }
}
