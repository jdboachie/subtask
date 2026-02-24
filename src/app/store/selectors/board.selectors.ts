import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoardState } from '../reducers/board.reducer';

export const selectBoardState = createFeatureSelector<BoardState>('boards');

export const selectIsLoading = createSelector(selectBoardState, (state) => state.isLoading);

export const selectError = createSelector(selectBoardState, (state) => state.error);

export const selectAllBoards = createSelector(
  selectBoardState,
  (state) => state.boardsOverride ?? state.boards,
);

export const selectBoardsOverride = createSelector(
  selectBoardState,
  (state) => state.boardsOverride,
);

export const selectBoardCount = createSelector(selectAllBoards, (boards) => boards.length);

export const selectSelectedBoardId = createSelector(
  selectBoardState,
  (state) => state.selectedBoardId,
);

export const selectCurrentBoard = createSelector(
  selectAllBoards,
  selectSelectedBoardId,
  (boards, selectedId) => {
    if (boards.length === 0) return null;

    if (selectedId) {
      const board = boards.find((b) => b.id === selectedId);
      if (board) return board;
    }

    return boards[0] ?? null;
  },
);

export const selectCurrentBoardIndex = createSelector(
  selectAllBoards,
  selectCurrentBoard,
  (boards, current) => {
    if (!current) return -1;
    return boards.findIndex((b) => b.id === current.id);
  },
);

export const selectBoardById = (id: string) =>
  createSelector(selectAllBoards, (boards) => boards.find((b) => b.id === id) ?? null);

export const selectTaskById = (taskId: string) =>
  createSelector(selectCurrentBoard, (board) => {
    if (!board) return null;

    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return null;
  });

export const selectColumnNames = createSelector(selectCurrentBoard, (board) =>
  board ? board.columns.map((c) => c.name) : [],
);

export const selectColumns = createSelector(selectCurrentBoard, (board) => board?.columns ?? []);
