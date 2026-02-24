import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { BoardActions } from '../actions/board.actions';
import { BoardData } from '../../ui/board/board.model';
import { selectAllBoards } from '../selectors/board.selectors';

const STORAGE_KEY = 'subtask.boards';

@Injectable()
export class BoardEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoards),
      switchMap(() =>
        fetch('/data.json')
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to load boards');
            }
            return response.json();
          })
          .then((data: BoardData) => BoardActions.loadBoardsSuccess({ boards: data.boards }))
          .catch((error) => BoardActions.loadBoardsFailure({ error: error.message })),
      ),
    ),
  );

  readonly syncToLocalStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BoardActions.createBoard,
          BoardActions.updateBoard,
          BoardActions.deleteBoard,
          BoardActions.addColumn,
          BoardActions.moveTask,
          BoardActions.addTask,
          BoardActions.updateTask,
          BoardActions.deleteTask,
          BoardActions.setBoardsOverride,
        ),
        withLatestFrom(this.store.select(selectAllBoards)),
        tap(([_, boards]) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
        }),
      ),
    { dispatch: false },
  );

  readonly loadFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoardsSuccess),
      map(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const boards = JSON.parse(raw);
            if (Array.isArray(boards) && boards.length > 0) {
              return BoardActions.setBoardsOverride({ boards });
            }
          } catch {
            console.error('Failed to parse boards from localStorage');
          }
        }
        return { type: '[Boards] No Local Storage Data' };
      }),
    ),
  );
}
