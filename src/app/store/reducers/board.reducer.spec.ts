import { boardReducer, initialBoardState, BoardState } from './board.reducer';
import { BoardActions } from '../actions/board.actions';
import type { Board, Task } from '../../ui/board/board.model';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Default Task',
  description: '',
  status: 'Todo',
  subtasks: [],
  ...overrides,
});

const makeBoard = (overrides: Partial<Board> = {}): Board => ({
  id: 'board-1',
  name: 'Test Board',
  columns: [
    { name: 'Todo', tasks: [] },
    { name: 'In Progress', tasks: [] },
    { name: 'Done', tasks: [] },
  ],
  ...overrides,
});

const stateWithBoards = (boards: Board[], selectedId?: string): BoardState => ({
  ...initialBoardState,
  boardsOverride: boards,
  selectedBoardId: selectedId ?? boards[0]?.id ?? null,
});

describe('boardReducer', () => {
  describe('Initial State', () => {
    it('should return initial state for an unknown action', () => {
      const state = boardReducer(undefined, { type: '__unknown__' } as any);
      expect(state).toEqual(initialBoardState);
    });

    it('should have empty boards initially', () => {
      expect(initialBoardState.boards).toEqual([]);
    });

    it('should have null selectedBoardId initially', () => {
      expect(initialBoardState.selectedBoardId).toBeNull();
    });

    it('should have isLoading false initially', () => {
      expect(initialBoardState.isLoading).toBe(false);
    });

    it('should have null error initially', () => {
      expect(initialBoardState.error).toBeNull();
    });
  });

  describe('loadBoards', () => {
    it('should set isLoading to true', () => {
      const state = boardReducer(initialBoardState, BoardActions.loadBoards());
      expect(state.isLoading).toBe(true);
    });

    it('should clear error', () => {
      const state = boardReducer(
        { ...initialBoardState, error: 'previous error' },
        BoardActions.loadBoards(),
      );
      expect(state.error).toBeNull();
    });
  });

  describe('loadBoardsSuccess', () => {
    const boards: Board[] = [makeBoard()];

    it('should set boards', () => {
      const state = boardReducer(
        { ...initialBoardState, isLoading: true },
        BoardActions.loadBoardsSuccess({ boards }),
      );
      expect(state.boards).toEqual(boards);
    });

    it('should set isLoading to false', () => {
      const state = boardReducer(
        { ...initialBoardState, isLoading: true },
        BoardActions.loadBoardsSuccess({ boards }),
      );
      expect(state.isLoading).toBe(false);
    });

    it('should clear error', () => {
      const state = boardReducer(
        { ...initialBoardState, error: 'old error' },
        BoardActions.loadBoardsSuccess({ boards }),
      );
      expect(state.error).toBeNull();
    });
  });

  describe('loadBoardsFailure', () => {
    it('should set error', () => {
      const state = boardReducer(
        { ...initialBoardState, isLoading: true },
        BoardActions.loadBoardsFailure({ error: 'Network error' }),
      );
      expect(state.error).toBe('Network error');
    });

    it('should set isLoading to false', () => {
      const state = boardReducer(
        { ...initialBoardState, isLoading: true },
        BoardActions.loadBoardsFailure({ error: 'Timeout' }),
      );
      expect(state.isLoading).toBe(false);
    });
  });

  describe('selectBoardById', () => {
    it('should set selectedBoardId when board exists', () => {
      const board = makeBoard({ id: 'board-1' });
      const state = boardReducer(
        stateWithBoards([board]),
        BoardActions.selectBoardById({ id: 'board-1' }),
      );
      expect(state.selectedBoardId).toBe('board-1');
    });

    it('should not change state when board id does not exist', () => {
      const board = makeBoard({ id: 'board-1' });
      const prev = stateWithBoards([board], 'board-1');
      const state = boardReducer(prev, BoardActions.selectBoardById({ id: 'nonexistent' }));
      expect(state.selectedBoardId).toBe('board-1');
    });
  });

  describe('selectBoardByName', () => {
    it('should set selectedBoardId when board with name exists', () => {
      const board = makeBoard({ id: 'board-1', name: 'My Board' });
      const state = boardReducer(
        stateWithBoards([board]),
        BoardActions.selectBoardByName({ name: 'My Board' }),
      );
      expect(state.selectedBoardId).toBe('board-1');
    });

    it('should not change state when board name does not exist', () => {
      const board = makeBoard({ id: 'board-1', name: 'My Board' });
      const prev = stateWithBoards([board], 'board-1');
      const state = boardReducer(prev, BoardActions.selectBoardByName({ name: 'Unknown' }));
      expect(state.selectedBoardId).toBe('board-1');
    });
  });

  describe('createBoard', () => {
    it('should add the new board to boardsOverride', () => {
      const state = boardReducer(
        initialBoardState,
        BoardActions.createBoard({ name: 'New Board', columnNames: ['Todo', 'Done'] }),
      );
      expect(state.boardsOverride).toHaveLength(1);
      expect(state.boardsOverride![0].name).toBe('New Board');
    });

    it('should create columns from columnNames', () => {
      const state = boardReducer(
        initialBoardState,
        BoardActions.createBoard({ name: 'Board', columnNames: ['Alpha', 'Beta'] }),
      );
      const cols = state.boardsOverride![0].columns;
      expect(cols.map((c) => c.name)).toEqual(['Alpha', 'Beta']);
    });

    it('should set selectedBoardId to the new board id', () => {
      const state = boardReducer(
        initialBoardState,
        BoardActions.createBoard({ name: 'Board', columnNames: [] }),
      );
      expect(state.selectedBoardId).toBe(state.boardsOverride![0].id);
    });

    it('should initialize columns with empty tasks', () => {
      const state = boardReducer(
        initialBoardState,
        BoardActions.createBoard({ name: 'Board', columnNames: ['Col'] }),
      );
      expect(state.boardsOverride![0].columns[0].tasks).toEqual([]);
    });

    it('should append to existing boards', () => {
      const existing = makeBoard({ id: 'old-1', name: 'Old Board' });
      const prev = stateWithBoards([existing]);
      const state = boardReducer(
        prev,
        BoardActions.createBoard({ name: 'New Board', columnNames: [] }),
      );
      expect(state.boardsOverride).toHaveLength(2);
    });

    it('should generate a unique id for the new board', () => {
      const s1 = boardReducer(
        initialBoardState,
        BoardActions.createBoard({ name: 'A', columnNames: [] }),
      );
      const s2 = boardReducer(
        initialBoardState,
        BoardActions.createBoard({ name: 'B', columnNames: [] }),
      );
      expect(s1.boardsOverride![0].id).not.toBe(s2.boardsOverride![0].id);
    });
  });

  describe('updateBoard', () => {
    it('should update board name', () => {
      const board = makeBoard({ id: 'b1', name: 'Old Name' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.updateBoard({ boardId: 'b1', name: 'New Name', columnNames: ['Todo'] }),
      );
      expect(state.boardsOverride![0].name).toBe('New Name');
    });

    it('should update column names', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.updateBoard({ boardId: 'b1', name: 'Board', columnNames: ['A', 'B'] }),
      );
      expect(state.boardsOverride![0].columns.map((c) => c.name)).toEqual(['A', 'B']);
    });

    it('should reassign task statuses when column names change', () => {
      const board = makeBoard({
        id: 'b1',
        columns: [{ name: 'Old', tasks: [makeTask({ status: 'Old' })] }],
      });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.updateBoard({ boardId: 'b1', name: 'Board', columnNames: ['Renamed'] }),
      );
      expect(state.boardsOverride![0].columns[0].tasks[0].status).toBe('Renamed');
    });

    it('should not modify state when board id not found', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board]);
      const state = boardReducer(
        prev,
        BoardActions.updateBoard({ boardId: 'nonexistent', name: 'X', columnNames: [] }),
      );
      expect(state).toBe(prev);
    });
  });

  describe('deleteBoard', () => {
    it('should remove the board', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board]);
      const state = boardReducer(prev, BoardActions.deleteBoard({ boardId: 'b1' }));
      expect(state.boardsOverride).toHaveLength(0);
    });

    it('should update selectedBoardId to first remaining board', () => {
      const b1 = makeBoard({ id: 'b1' });
      const b2 = makeBoard({ id: 'b2' });
      const prev = stateWithBoards([b1, b2], 'b1');
      const state = boardReducer(prev, BoardActions.deleteBoard({ boardId: 'b1' }));
      expect(state.selectedBoardId).toBe('b2');
    });

    it('should set selectedBoardId to null when last board deleted', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.deleteBoard({ boardId: 'b1' }));
      expect(state.selectedBoardId).toBeNull();
    });

    it('should not change selectedBoardId when deleting non-selected board', () => {
      const b1 = makeBoard({ id: 'b1' });
      const b2 = makeBoard({ id: 'b2' });
      const prev = stateWithBoards([b1, b2], 'b1');
      const state = boardReducer(prev, BoardActions.deleteBoard({ boardId: 'b2' }));
      expect(state.selectedBoardId).toBe('b1');
    });
  });

  describe('addColumn', () => {
    it('should add column to current board', () => {
      const board = makeBoard({ id: 'b1', columns: [{ name: 'Todo', tasks: [] }] });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.addColumn({ name: 'Review' }));
      const cols = state.boardsOverride![0].columns;
      expect(cols).toHaveLength(2);
      expect(cols[1].name).toBe('Review');
    });

    it('should initialize new column with empty tasks', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.addColumn({ name: 'New' }));
      const lastCol = state.boardsOverride![0].columns.at(-1);
      expect(lastCol?.tasks).toEqual([]);
    });

    it('should not modify state when there is no current board', () => {
      const state = boardReducer(initialBoardState, BoardActions.addColumn({ name: 'Col' }));
      expect(state).toEqual(initialBoardState);
    });
  });

  describe('addTask', () => {
    it('should add task to the matching column', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.addTask({
          title: 'New Task',
          description: 'desc',
          status: 'Todo',
          subtasks: [],
        }),
      );
      expect(state.boardsOverride![0].columns[0].tasks).toHaveLength(1);
      expect(state.boardsOverride![0].columns[0].tasks[0].title).toBe('New Task');
    });

    it('should not add task to non-matching columns', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.addTask({ title: 'Task', description: '', status: 'Todo', subtasks: [] }),
      );
      expect(state.boardsOverride![0].columns[1].tasks).toHaveLength(0);
      expect(state.boardsOverride![0].columns[2].tasks).toHaveLength(0);
    });

    it('should generate a unique id for new task', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const s1 = boardReducer(
        prev,
        BoardActions.addTask({ title: 'T1', description: '', status: 'Todo', subtasks: [] }),
      );
      const s2 = boardReducer(
        prev,
        BoardActions.addTask({ title: 'T2', description: '', status: 'Todo', subtasks: [] }),
      );
      const id1 = s1.boardsOverride![0].columns[0].tasks[0].id;
      const id2 = s2.boardsOverride![0].columns[0].tasks[0].id;
      expect(id1).not.toBe(id2);
    });

    it('should set task status to column name', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.addTask({
          title: 'Task',
          description: '',
          status: 'In Progress',
          subtasks: [],
        }),
      );
      expect(state.boardsOverride![0].columns[1].tasks[0].status).toBe('In Progress');
    });
  });

  describe('updateTask', () => {
    it('should update task title in place', () => {
      const task = makeTask({ id: 't1', status: 'Todo' });
      const board = makeBoard({
        id: 'b1',
        columns: [
          { name: 'Todo', tasks: [task] },
          { name: 'Done', tasks: [] },
        ],
      });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.updateTask({
          taskId: 't1',
          title: 'Updated Title',
          description: '',
          status: 'Todo',
          subtasks: [],
        }),
      );
      expect(state.boardsOverride![0].columns[0].tasks[0].title).toBe('Updated Title');
    });

    it('should move task to new column when status changes', () => {
      const task = makeTask({ id: 't1', status: 'Todo' });
      const board = makeBoard({
        id: 'b1',
        columns: [
          { name: 'Todo', tasks: [task] },
          { name: 'Done', tasks: [] },
        ],
      });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.updateTask({
          taskId: 't1',
          title: 'Task',
          description: '',
          status: 'Done',
          subtasks: [],
        }),
      );
      expect(state.boardsOverride![0].columns[0].tasks).toHaveLength(0);
      expect(state.boardsOverride![0].columns[1].tasks).toHaveLength(1);
    });

    it('should update subtasks', () => {
      const task = makeTask({
        id: 't1',
        status: 'Todo',
        subtasks: [{ title: 'Sub', isCompleted: false }],
      });
      const board = makeBoard({
        id: 'b1',
        columns: [{ name: 'Todo', tasks: [task] }],
      });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.updateTask({
          taskId: 't1',
          title: 'Task',
          description: '',
          status: 'Todo',
          subtasks: [{ title: 'Sub', isCompleted: true }],
        }),
      );
      expect(state.boardsOverride![0].columns[0].tasks[0].subtasks[0].isCompleted).toBe(true);
    });

    it('should not change state when task id does not exist', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(
        prev,
        BoardActions.updateTask({
          taskId: 'nonexistent',
          title: 'Task',
          description: '',
          status: 'Todo',
          subtasks: [],
        }),
      );
      expect(state).toBe(prev);
    });
  });

  describe('deleteTask', () => {
    it('should remove the task from its column', () => {
      const task = makeTask({ id: 't1', status: 'Todo' });
      const board = makeBoard({
        id: 'b1',
        columns: [
          { name: 'Todo', tasks: [task] },
          { name: 'Done', tasks: [] },
        ],
      });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.deleteTask({ taskId: 't1' }));
      expect(state.boardsOverride![0].columns[0].tasks).toHaveLength(0);
    });

    it('should not affect other tasks in the same column', () => {
      const t1 = makeTask({ id: 't1', title: 'Task 1' });
      const t2 = makeTask({ id: 't2', title: 'Task 2' });
      const board = makeBoard({
        id: 'b1',
        columns: [{ name: 'Todo', tasks: [t1, t2] }],
      });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.deleteTask({ taskId: 't1' }));
      expect(state.boardsOverride![0].columns[0].tasks).toHaveLength(1);
      expect(state.boardsOverride![0].columns[0].tasks[0].id).toBe('t2');
    });

    it('should not modify state if task id not found', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.deleteTask({ taskId: 'nonexistent' }));
      expect(state.boardsOverride).toEqual(prev.boardsOverride);
    });
  });

  describe('setBoardsOverride', () => {
    it('should set boardsOverride to provided boards', () => {
      const boards = [makeBoard()];
      const state = boardReducer(initialBoardState, BoardActions.setBoardsOverride({ boards }));
      expect(state.boardsOverride).toEqual(boards);
    });

    it('should replace any existing boardsOverride', () => {
      const old = [makeBoard({ id: 'old' })];
      const newBoards = [makeBoard({ id: 'new' })];
      const prev = { ...initialBoardState, boardsOverride: old };
      const state = boardReducer(prev, BoardActions.setBoardsOverride({ boards: newBoards }));
      expect(state.boardsOverride).toEqual(newBoards);
    });
  });

  describe('selectBoard', () => {
    it('should set selectedBoardId by index', () => {
      const b1 = makeBoard({ id: 'b1' });
      const b2 = makeBoard({ id: 'b2' });
      const prev = stateWithBoards([b1, b2], 'b1');
      const state = boardReducer(prev, BoardActions.selectBoard({ index: 1 }));
      expect(state.selectedBoardId).toBe('b2');
    });

    it('should not change state for out-of-bounds index', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.selectBoard({ index: 99 }));
      expect(state).toBe(prev);
    });

    it('should not change state for negative index', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board], 'b1');
      const state = boardReducer(prev, BoardActions.selectBoard({ index: -1 }));
      expect(state).toBe(prev);
    });
  });

  describe('Immutability', () => {
    it('should return a new state reference on update', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board]);
      const next = boardReducer(prev, BoardActions.addColumn({ name: 'New' }));
      expect(next).not.toBe(prev);
    });

    it('should not mutate the previous state boards array', () => {
      const board = makeBoard({ id: 'b1' });
      const prev = stateWithBoards([board]);
      const prevBoards = prev.boardsOverride;
      boardReducer(prev, BoardActions.createBoard({ name: 'New', columnNames: [] }));
      expect(prev.boardsOverride).toBe(prevBoards);
    });
  });
});
