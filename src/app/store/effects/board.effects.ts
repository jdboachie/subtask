import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BoardActions } from '../actions/board.actions';
import { selectAllBoards } from '../selectors/board.selectors';
import { BoardService } from '../../services/board.service';

const STORAGE_KEY = 'subtask.boards';

@Injectable()
export class BoardEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly boardService = inject(BoardService);

  readonly loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoards),
      switchMap(() =>
        this.boardService.getAllBoards().pipe(
          map((data) => BoardActions.loadBoardsSuccess({ boards: data.boards })),
          catchError((error: Error) =>
            of(BoardActions.loadBoardsFailure({ error: error.message })),
          ),
        ),
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
