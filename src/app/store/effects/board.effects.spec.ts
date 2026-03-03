import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ReplaySubject, firstValueFrom, of, throwError } from 'rxjs';
import { BoardEffects } from './board.effects';
import { BoardActions } from '../actions/board.actions';
import { Board } from '../../ui/board/board.model';
import { selectAllBoards } from '../selectors/board.selectors';
import { BoardService } from '../../services/board.service';

const STORAGE_KEY = 'subtask.boards';

describe('BoardEffects', () => {
  let effects: BoardEffects;
  let actions$: ReplaySubject<any>;
  let store: MockStore;
  let mockBoardService: jest.Mocked<Pick<BoardService, 'getAllBoards'>>;

  const mockBoards: Board[] = [
    { id: '1', name: 'Platform Launch', columns: [] },
    { id: '2', name: 'Marketing Plan', columns: [] },
  ];

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    mockBoardService = { getAllBoards: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        BoardEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            boards: {
              boards: [],
              boardsOverride: null,
              selectedBoardId: null,
              isLoading: false,
              error: null,
            },
          },
        }),
        { provide: BoardService, useValue: mockBoardService },
      ],
    });

    effects = TestBed.inject(BoardEffects);
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectAllBoards, mockBoards as any);
    store.refreshState();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('loadBoards$', () => {
    it('dispatches loadBoardsSuccess with boards on successful fetch', async () => {
      mockBoardService.getAllBoards.mockReturnValue(of({ boards: mockBoards }));

      actions$.next(BoardActions.loadBoards());

      const action = await firstValueFrom(effects.loadBoards$);

      expect(action).toEqual(BoardActions.loadBoardsSuccess({ boards: mockBoards as any }));
    });

    it('dispatches loadBoardsFailure when the service errors', async () => {
      mockBoardService.getAllBoards.mockReturnValue(
        throwError(() => new Error('Failed to load boards')),
      );

      actions$.next(BoardActions.loadBoards());

      const action = await firstValueFrom(effects.loadBoards$);

      expect(action).toEqual(BoardActions.loadBoardsFailure({ error: 'Failed to load boards' }));
    });

    it('dispatches loadBoardsFailure on network error', async () => {
      mockBoardService.getAllBoards.mockReturnValue(throwError(() => new Error('Network error')));

      actions$.next(BoardActions.loadBoards());

      const action = await firstValueFrom(effects.loadBoards$);

      expect(action).toEqual(BoardActions.loadBoardsFailure({ error: 'Network error' }));
    });

    it('calls BoardService.getAllBoards', async () => {
      mockBoardService.getAllBoards.mockReturnValue(of({ boards: [] }));

      actions$.next(BoardActions.loadBoards());

      await firstValueFrom(effects.loadBoards$);

      expect(mockBoardService.getAllBoards).toHaveBeenCalledTimes(1);
    });
  });

  describe('syncToLocalStorage$', () => {
    it('writes boards to localStorage when createBoard is dispatched', async () => {
      actions$.next(BoardActions.createBoard({ name: 'My Board', columnNames: ['Todo'] }));

      await firstValueFrom(effects.syncToLocalStorage$);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual(mockBoards);
    });

    it('writes boards to localStorage when updateBoard is dispatched', async () => {
      actions$.next(BoardActions.updateBoard({ boardId: '1', name: 'Renamed', columnNames: [] }));

      await firstValueFrom(effects.syncToLocalStorage$);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual(mockBoards);
    });

    it('writes boards to localStorage when deleteBoard is dispatched', async () => {
      actions$.next(BoardActions.deleteBoard({ boardId: '1' }));

      await firstValueFrom(effects.syncToLocalStorage$);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual(mockBoards);
    });

    it('writes boards to localStorage when addColumn is dispatched', async () => {
      actions$.next(BoardActions.addColumn({ name: 'Done' }));

      await firstValueFrom(effects.syncToLocalStorage$);

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    it('writes boards to localStorage when addTask is dispatched', async () => {
      actions$.next(
        BoardActions.addTask({ status: 'Todo', title: 'New Task', description: '', subtasks: [] }),
      );

      await firstValueFrom(effects.syncToLocalStorage$);

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    it('writes boards to localStorage when deleteTask is dispatched', async () => {
      actions$.next(BoardActions.deleteTask({ taskId: 'task-1' }));

      await firstValueFrom(effects.syncToLocalStorage$);

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    it('writes boards to localStorage when setBoardsOverride is dispatched', async () => {
      actions$.next(BoardActions.setBoardsOverride({ boards: mockBoards }));

      await firstValueFrom(effects.syncToLocalStorage$);

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    it('serialises board data as JSON', async () => {
      actions$.next(BoardActions.createBoard({ name: 'My Board', columnNames: [] }));

      await firstValueFrom(effects.syncToLocalStorage$);

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(() => JSON.parse(raw!)).not.toThrow();
    });
  });

  describe('loadFromLocalStorage$', () => {
    it('dispatches setBoardsOverride when valid boards exist in localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBoards));

      actions$.next(BoardActions.loadBoardsSuccess({ boards: [] as any }));

      const action = await firstValueFrom(effects.loadFromLocalStorage$);

      expect(action).toEqual(BoardActions.setBoardsOverride({ boards: mockBoards as any }));
    });

    it('dispatches no-op action when localStorage is empty', async () => {
      actions$.next(BoardActions.loadBoardsSuccess({ boards: [] as any }));

      const action = await firstValueFrom(effects.loadFromLocalStorage$);

      expect(action).toEqual({ type: '[Boards] No Local Storage Data' });
    });

    it('dispatches no-op action when boards array in localStorage is empty', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

      actions$.next(BoardActions.loadBoardsSuccess({ boards: [] as any }));

      const action = await firstValueFrom(effects.loadFromLocalStorage$);

      expect(action).toEqual({ type: '[Boards] No Local Storage Data' });
    });

    it('dispatches no-op action when localStorage value is not valid JSON', async () => {
      localStorage.setItem(STORAGE_KEY, 'NOT_VALID_JSON!!!');

      actions$.next(BoardActions.loadBoardsSuccess({ boards: [] as any }));

      const action = await firstValueFrom(effects.loadFromLocalStorage$);

      expect(action).toEqual({ type: '[Boards] No Local Storage Data' });
    });

    it('dispatches no-op action when localStorage value is not an array', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: '1' }));

      actions$.next(BoardActions.loadBoardsSuccess({ boards: [] as any }));

      const action = await firstValueFrom(effects.loadFromLocalStorage$);

      expect(action).toEqual({ type: '[Boards] No Local Storage Data' });
    });
  });
});
