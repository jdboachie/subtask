import { computed, Injectable, resource, signal } from '@angular/core';
import { Board, BoardData, Task, Subtask } from './ui/board/board.model';

export interface MoveTaskEvent {
  sourceColumnIndex: number;
  targetColumnIndex: number;
  sourceTaskIndex: number;
  targetTaskIndex: number;
}

function generateId(): string {
  return crypto.randomUUID();
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

  readonly boards = computed<readonly Board[]>(
    () => this.boardsOverride() ?? this.boardsResource.value() ?? [],
  );
  readonly boardCount = computed(() => this.boards().length);

  private readonly selectedBoardId = signal<string | null>(null);

  readonly currentBoard = computed(() => {
    const boards = this.boards();
    const selectedId = this.selectedBoardId();

    if (boards.length === 0) {
      return null;
    }

    if (selectedId) {
      const board = boards.find((b) => b.id === selectedId);
      if (board) {
        return board;
      }
    }

    return boards[0] ?? null;
  });

  readonly currentBoardIndex = computed(() => {
    const boards = this.boards();
    const current = this.currentBoard();
    if (!current) {
      return -1;
    }
    return boards.findIndex((b) => b.id === current.id);
  });

  selectBoard(index: number): void {
    const boards = this.boards();
    if (index >= 0 && index < boards.length) {
      const board = boards[index];
      this.selectedBoardId.set(board.id);
    }
  }

  selectBoardById(id: string): void {
    const boards = this.boards();
    const board = boards.find((b) => b.id === id);
    if (board) {
      this.selectedBoardId.set(id);
    }
  }

  selectBoardByName(name: string): void {
    const boards = this.boards();
    const board = boards.find((b) => b.name === name);
    if (board) {
      this.selectedBoardId.set(board.id);
    }
  }

  getBoardById(id: string): Board | null {
    return this.boards().find((b) => b.id === id) ?? null;
  }

  createBoard(name: string, columnNames: string[] = []): Board {
    const columns = columnNames.map((n) => ({ name: n, tasks: [] as Task[] }));

    const newBoard: Board = {
      id: generateId(),
      name,
      columns,
    };

    const boards = this.boards();
    this.boardsOverride.set([...boards, newBoard]);
    this.selectedBoardId.set(newBoard.id);

    return newBoard;
  }

  updateBoard(boardId: string, name: string, columnNames: string[]): Board | null {
    const boards = this.boards();
    const boardIndex = boards.findIndex((b) => b.id === boardId);

    if (boardIndex === -1) return null;

    const board = boards[boardIndex];

    const newColumns = columnNames.map((columnName, index) => {
      const existingColumn = board.columns[index];
      if (existingColumn) {
        const tasks = existingColumn.tasks.map((task) => ({
          ...task,
          status: columnName,
        }));
        return { name: columnName, tasks };
      }
      return { name: columnName, tasks: [] as Task[] };
    });

    const updatedBoard: Board = {
      ...board,
      name,
      columns: newColumns,
    };

    const newBoards = boards.map((b, i) => (i === boardIndex ? updatedBoard : b));
    this.boardsOverride.set(newBoards);

    return updatedBoard;
  }

  deleteBoard(boardId: string): Board | null {
    const boards = this.boards();
    const boardIndex = boards.findIndex((b) => b.id === boardId);

    if (boardIndex === -1) return null;

    const deletedBoard = boards[boardIndex];
    const newBoards = boards.filter((_, i) => i !== boardIndex);

    this.boardsOverride.set(newBoards);

    if (this.selectedBoardId() === boardId) {
      if (newBoards.length > 0) {
        this.selectedBoardId.set(newBoards[0].id);
      } else {
        this.selectedBoardId.set(null);
      }
    }

    return deletedBoard;
  }

  moveTask(event: MoveTaskEvent): void {
    const { sourceColumnIndex, targetColumnIndex, sourceTaskIndex, targetTaskIndex } = event;
    const boards = this.boards();
    const board = this.currentBoard();

    if (!board) return;

    const boardIndex = boards.findIndex((b) => b.id === board.id);
    if (boardIndex === -1) return;

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

  addTask(status: string, title: string, description: string, subtasks: readonly Subtask[]): void {
    const boards = this.boards();
    const board = this.currentBoard();

    if (!board) return;

    const boardIndex = boards.findIndex((b) => b.id === board.id);
    if (boardIndex === -1) return;

    const columns = board.columns.map((column) => {
      if (column.name === status) {
        const newTask: Task = {
          id: generateId(),
          title,
          description,
          status: column.name,
          subtasks,
        };
        return { ...column, tasks: [...column.tasks, newTask] };
      }
      return column;
    });

    const newBoard: Board = { ...board, columns };
    const newBoards = boards.map((b, i) => (i === boardIndex ? newBoard : b));

    this.boardsOverride.set(newBoards);
  }

  addColumn(name: string) {
    const boards = this.boards();
    const board = this.currentBoard();

    if (!board) return;

    const boardIndex = boards.findIndex((b) => b.id === board.id);
    if (boardIndex === -1) return;

    const newColumns = [...board.columns, { name, tasks: [] as Task[] }];

    const newBoard: Board = { ...board, columns: newColumns };
    const newBoards = boards.map((b, i) => (i === boardIndex ? newBoard : b));

    this.boardsOverride.set(newBoards);
  }
}
