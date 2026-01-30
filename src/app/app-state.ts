import { computed, Injectable, resource, signal } from '@angular/core';
import { Board, BoardData, Task } from './ui/board/board.model';

export interface MoveTaskEvent {
  sourceColumnIndex: number;
  targetColumnIndex: number;
  sourceTaskIndex: number;
  targetTaskIndex: number;
}

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

  private readonly boardsOverride = signal<Board[] | null>(null);

  readonly isLoading = this.boardsResource.isLoading;

  readonly boards = computed(() => this.boardsOverride() ?? this.boardsResource.value() ?? []);
  readonly boardCount = computed(() => this.boards().length);

  private readonly selectedBoardIndex = signal<number>(0);

  readonly currentBoard = computed(() => {
    const boards = this.boards();
    if (boards.length > 0) {
      const index = this.selectedBoardIndex();
      return boards[index] ?? null;
    }
    return null;
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

  moveTask(event: MoveTaskEvent): void {
    const { sourceColumnIndex, targetColumnIndex, sourceTaskIndex, targetTaskIndex } = event;
    const boards = this.boards();
    const boardIndex = this.selectedBoardIndex();
    const board = boards[boardIndex];

    if (!board) return;

    const sourceColumn = board.columns[sourceColumnIndex];
    const targetColumn = board.columns[targetColumnIndex];

    if (!sourceColumn || !targetColumn) return;

    const task = sourceColumn.tasks[sourceTaskIndex];
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      status: targetColumn.name,
    };

    const newColumns = board.columns.map((column, colIndex) => {
      if (colIndex === sourceColumnIndex && colIndex === targetColumnIndex) {
        const tasks = [...column.tasks];
        tasks.splice(sourceTaskIndex, 1);
        tasks.splice(targetTaskIndex, 0, updatedTask);
        return { ...column, tasks };
      }

      if (colIndex === sourceColumnIndex) {
        const tasks = column.tasks.filter((_, i) => i !== sourceTaskIndex);
        return { ...column, tasks };
      }

      if (colIndex === targetColumnIndex) {
        const tasks = [...column.tasks];
        tasks.splice(targetTaskIndex, 0, updatedTask);
        return { ...column, tasks };
      }

      return column;
    });

    const newBoard: Board = { ...board, columns: newColumns };
    const newBoards = boards.map((b, i) => (i === boardIndex ? newBoard : b));

    this.boardsOverride.set(newBoards);
  }
}
