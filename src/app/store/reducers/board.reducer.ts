import { createReducer, on } from '@ngrx/store';
import { BoardActions } from '../actions/board.actions';
import { Board, Task } from '../../ui/board/board.model';
import { generateId } from '../../utils';

export interface BoardState {
  readonly boards: readonly Board[];
  readonly selectedBoardId: string | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly boardsOverride: Board[] | null;
}

export const initialBoardState: BoardState = {
  boards: [],
  selectedBoardId: null,
  isLoading: false,
  error: null,
  boardsOverride: null,
};

function findBoardIndex(boards: readonly Board[], id: string): number {
  return boards.findIndex((b) => b.id === id);
}

function getCurrentBoard(state: BoardState): Board | null {
  const boards = state.boardsOverride ?? state.boards;
  if (boards.length === 0) return null;

  if (state.selectedBoardId) {
    const board = boards.find((b) => b.id === state.selectedBoardId);
    if (board) return board;
  }

  return boards[0] ?? null;
}

export const boardReducer = createReducer(
  initialBoardState,

  on(BoardActions.loadBoards, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(BoardActions.loadBoardsSuccess, (state, { boards }) => ({
    ...state,
    boards,
    isLoading: false,
    error: null,
  })),

  on(BoardActions.loadBoardsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(BoardActions.selectBoard, (state, { index }) => {
    const boards = state.boardsOverride ?? state.boards;
    if (index >= 0 && index < boards.length) {
      return {
        ...state,
        selectedBoardId: boards[index].id,
      };
    }
    return state;
  }),

  on(BoardActions.selectBoardById, (state, { id }) => {
    const boards = state.boardsOverride ?? state.boards;
    const board = boards.find((b) => b.id === id);
    if (board) {
      return {
        ...state,
        selectedBoardId: id,
      };
    }
    return state;
  }),

  on(BoardActions.selectBoardByName, (state, { name }) => {
    const boards = state.boardsOverride ?? state.boards;
    const board = boards.find((b) => b.name === name);
    if (board) {
      return {
        ...state,
        selectedBoardId: board.id,
      };
    }
    return state;
  }),

  on(BoardActions.createBoard, (state, { name, columnNames }) => {
    const columns = columnNames.map((n) => ({ name: n, tasks: [] as Task[] }));
    const newBoard: Board = {
      id: generateId(),
      name,
      columns,
    };

    const boards = state.boardsOverride ?? state.boards;
    return {
      ...state,
      boardsOverride: [...boards, newBoard],
      selectedBoardId: newBoard.id,
    };
  }),

  on(BoardActions.updateBoard, (state, { boardId, name, columnNames }) => {
    const boards = state.boardsOverride ?? state.boards;
    const boardIndex = findBoardIndex(boards, boardId);

    if (boardIndex === -1) return state;

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

    return {
      ...state,
      boardsOverride: boards.map((b, i) => (i === boardIndex ? updatedBoard : b)),
    };
  }),

  on(BoardActions.deleteBoard, (state, { boardId }) => {
    const boards = state.boardsOverride ?? state.boards;
    const newBoards = boards.filter((b) => b.id !== boardId);

    let newSelectedId = state.selectedBoardId;
    if (state.selectedBoardId === boardId) {
      newSelectedId = newBoards.length > 0 ? newBoards[0].id : null;
    }

    return {
      ...state,
      boardsOverride: newBoards,
      selectedBoardId: newSelectedId,
    };
  }),

  on(BoardActions.addColumn, (state, { name }) => {
    const boards = state.boardsOverride ?? state.boards;
    const currentBoard = getCurrentBoard(state);
    if (!currentBoard) return state;

    const boardIndex = findBoardIndex(boards, currentBoard.id);
    if (boardIndex === -1) return state;

    const newColumns = [...currentBoard.columns, { name, tasks: [] as Task[] }];
    const newBoard: Board = { ...currentBoard, columns: newColumns };

    return {
      ...state,
      boardsOverride: boards.map((b, i) => (i === boardIndex ? newBoard : b)),
    };
  }),

  on(BoardActions.moveTask, (state, event) => {
    const { sourceColumnIndex, targetColumnIndex, sourceTaskIndex, targetTaskIndex } = event;
    const boards = state.boardsOverride ?? state.boards;
    const currentBoard = getCurrentBoard(state);
    if (!currentBoard) return state;

    const boardIndex = findBoardIndex(boards, currentBoard.id);
    if (boardIndex === -1) return state;

    const sourceColumn = currentBoard.columns[sourceColumnIndex];
    const targetColumn = currentBoard.columns[targetColumnIndex];
    if (!sourceColumn || !targetColumn) return state;

    const task = sourceColumn.tasks[sourceTaskIndex];
    if (!task) return state;

    const updatedTask: Task = {
      ...task,
      status: targetColumn.name,
    };

    const newColumns = currentBoard.columns.map((column, colIndex) => {
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

    const newBoard: Board = { ...currentBoard, columns: newColumns };

    return {
      ...state,
      boardsOverride: boards.map((b, i) => (i === boardIndex ? newBoard : b)),
    };
  }),

  on(BoardActions.addTask, (state, { status, title, description, subtasks }) => {
    const boards = state.boardsOverride ?? state.boards;
    const currentBoard = getCurrentBoard(state);
    if (!currentBoard) return state;

    const boardIndex = findBoardIndex(boards, currentBoard.id);
    if (boardIndex === -1) return state;

    const columns = currentBoard.columns.map((column) => {
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

    const newBoard: Board = { ...currentBoard, columns };

    return {
      ...state,
      boardsOverride: boards.map((b, i) => (i === boardIndex ? newBoard : b)),
    };
  }),

  on(BoardActions.updateTask, (state, { taskId, status, title, description, subtasks }) => {
    const boards = state.boardsOverride ?? state.boards;
    const currentBoard = getCurrentBoard(state);
    if (!currentBoard) return state;

    const boardIndex = findBoardIndex(boards, currentBoard.id);
    if (boardIndex === -1) return state;

    let sourceColumnIndex = -1;
    let taskIndex = -1;
    for (let ci = 0; ci < currentBoard.columns.length; ci++) {
      const ti = currentBoard.columns[ci].tasks.findIndex((t) => t.id === taskId);
      if (ti !== -1) {
        sourceColumnIndex = ci;
        taskIndex = ti;
        break;
      }
    }

    if (sourceColumnIndex === -1 || taskIndex === -1) return state;

    const updated: Task = {
      id: taskId,
      title,
      description,
      status,
      subtasks: subtasks as Task['subtasks'],
    };

    let targetColumnIndex = currentBoard.columns.findIndex((c) => c.name === status);
    if (targetColumnIndex === -1) {
      targetColumnIndex = sourceColumnIndex;
    }

    let newColumns: Board['columns'] = [];

    if (targetColumnIndex === sourceColumnIndex) {
      newColumns = currentBoard.columns.map((c, index) => {
        if (index !== sourceColumnIndex) return c;
        const tasks = [...c.tasks];
        tasks[taskIndex] = updated;
        return { ...c, tasks };
      });
    } else {
      newColumns = currentBoard.columns.map((c, index) => {
        if (index === sourceColumnIndex) {
          const tasks = c.tasks.filter((_, i) => i !== taskIndex);
          return { ...c, tasks };
        }
        if (index === targetColumnIndex) {
          const tasks = [...c.tasks, updated];
          return { ...c, tasks };
        }
        return c;
      });
    }

    const newBoard: Board = { ...currentBoard, columns: newColumns };

    return {
      ...state,
      boardsOverride: boards.map((b, i) => (i === boardIndex ? newBoard : b)),
    };
  }),

  on(BoardActions.deleteTask, (state, { taskId }) => {
    const boards = state.boardsOverride ?? state.boards;
    const currentBoard = getCurrentBoard(state);
    if (!currentBoard) return state;

    const boardIndex = findBoardIndex(boards, currentBoard.id);
    if (boardIndex === -1) return state;

    const newColumns = currentBoard.columns.map((column) => {
      const taskIndex = column.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        return {
          ...column,
          tasks: column.tasks.filter((_, i) => i !== taskIndex),
        };
      }
      return column;
    });

    const newBoard: Board = { ...currentBoard, columns: newColumns };

    return {
      ...state,
      boardsOverride: boards.map((b, i) => (i === boardIndex ? newBoard : b)),
    };
  }),

  on(BoardActions.setBoardsOverride, (state, { boards }) => ({
    ...state,
    boardsOverride: boards,
  })),
);
