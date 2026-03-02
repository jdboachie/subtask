import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { BoardView } from './board';
import { Board, Column, Task } from './board.model';
import { BoardActions, BoardSelectors } from '../../store';

describe('BoardView Component', () => {
  let fixture: any;
  let component: BoardView;
  let store: Store;
  let router: Router;

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'todo',
      subtasks: [],
    },
    {
      id: 'task-2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'todo',
      subtasks: [],
    },
  ];

  const mockColumns: Column[] = [
    {
      name: 'Todo',
      tasks: mockTasks,
    },
    {
      name: 'In Progress',
      tasks: [],
    },
    {
      name: 'Done',
      tasks: [],
    },
  ];

  const mockBoard: Board = {
    id: 'board-1',
    name: 'My Board',
    columns: mockColumns,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardView],
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(mockBoard)),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardView);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the board view component', () => {
      expect(component).toBeTruthy();
    });

    it('should have null currentBoard by default', () => {
      expect(component.currentBoard()).toBeNull();
    });
  });

  describe('Current Board Input', () => {
    it('should accept currentBoard input', () => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();
      expect(component.currentBoard()).toEqual(mockBoard);
    });

    it('should update when currentBoard changes', () => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();

      const newBoard: Board = {
        ...mockBoard,
        name: 'Updated Board',
      };
      fixture.componentRef.setInput('currentBoard', newBoard);
      fixture.detectChanges();

      expect(component.currentBoard()?.name).toBe('Updated Board');
    });

    it('should handle null currentBoard', () => {
      fixture.componentRef.setInput('currentBoard', null);
      fixture.detectChanges();
      expect(component.currentBoard()).toBeNull();
    });

    it('should transition from null to board and back', () => {
      fixture.componentRef.setInput('currentBoard', null);
      fixture.detectChanges();
      expect(component.currentBoard()).toBeNull();

      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();
      expect(component.currentBoard()).toBeTruthy();

      fixture.componentRef.setInput('currentBoard', null);
      fixture.detectChanges();
      expect(component.currentBoard()).toBeNull();
    });
  });

  describe('Task Movement', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();
    });

    it('should dispatch moveTask action on task drop', () => {
      const dropEvent = {
        sourceColumnIndex: 0,
        targetColumnIndex: 1,
        sourceTaskIndex: 0,
        targetTaskIndex: 0,
      };

      component['onTaskDrop'](dropEvent);

      expect(store.dispatch).toHaveBeenCalledWith(BoardActions.moveTask(dropEvent));
    });

    it('should have taskMoved output', () => {
      expect(component.taskMoved).toBeTruthy();
    });

    it('should handle multiple consecutive moves', () => {
      const dropEvent1 = {
        sourceColumnIndex: 0,
        targetColumnIndex: 1,
        sourceTaskIndex: 0,
        targetTaskIndex: 0,
      };

      const dropEvent2 = {
        sourceColumnIndex: 1,
        targetColumnIndex: 2,
        sourceTaskIndex: 0,
        targetTaskIndex: 1,
      };

      component['onTaskDrop'](dropEvent1);
      component['onTaskDrop'](dropEvent2);

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Add Column Navigation', () => {
    it('should navigate to new-column when currentBoard exists', () => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();

      component['onAddColumn']();

      expect(router.navigate).toHaveBeenCalledWith(['/boards/', 'board-1', 'new-column']);
    });

    it('should use currentBoard from store when input is null', () => {
      fixture.componentRef.setInput('currentBoard', null);
      fixture.detectChanges();

      component['onAddColumn']();

      expect(router.navigate).toHaveBeenCalledWith(['/boards/', 'board-1', 'new-column']);
      expect(store.selectSignal).toHaveBeenCalledWith(BoardSelectors.selectCurrentBoard);
    });

    it('should navigate with correct board ID', () => {
      const boardWithDifferentId: Board = {
        id: 'board-123',
        name: 'My Board',
        columns: mockColumns,
      };
      fixture.componentRef.setInput('currentBoard', boardWithDifferentId);
      fixture.detectChanges();

      component['onAddColumn']();

      expect(router.navigate).toHaveBeenCalledWith(['/boards/', 'board-123', 'new-column']);
    });

    it('should not navigate if no board is available', () => {
      fixture.componentRef.setInput('currentBoard', null);
      (store.selectSignal as jest.Mock).mockReturnValue(() => null);
      fixture.detectChanges();

      component['onAddColumn']();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Outputs', () => {
    it('should have taskMoved output event', () => {
      expect(component.taskMoved).toBeTruthy();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();
    });

    it('should have component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should accept currentBoard input for rendering', () => {
      expect(component.currentBoard()).toEqual(mockBoard);
    });
  });

  describe('Board Updates', () => {
    it('should handle board with different number of columns', () => {
      const boardWithTwoColumns: Board = {
        id: mockBoard.id,
        name: mockBoard.name,
        columns: mockColumns.slice(0, 2),
      };
      fixture.componentRef.setInput('currentBoard', boardWithTwoColumns);
      fixture.detectChanges();

      expect(component.currentBoard()?.columns.length).toBe(2);
    });

    it('should handle board with empty columns', () => {
      const boardWithNoColumns: Board = {
        id: mockBoard.id,
        name: mockBoard.name,
        columns: [],
      };
      fixture.componentRef.setInput('currentBoard', boardWithNoColumns);
      fixture.detectChanges();

      expect(component.currentBoard()?.columns.length).toBe(0);
    });

    it('should handle board title changes', () => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();

      const updatedBoard: Board = {
        id: mockBoard.id,
        name: 'New Board Title',
        columns: mockBoard.columns,
      };
      fixture.componentRef.setInput('currentBoard', updatedBoard);
      fixture.detectChanges();

      expect(component.currentBoard()?.name).toBe('New Board Title');
    });
  });

  describe('Drop Event Details', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();
    });

    it('should correctly dispatch move within same column', () => {
      const dropEvent = {
        sourceColumnIndex: 0,
        targetColumnIndex: 0,
        sourceTaskIndex: 0,
        targetTaskIndex: 1,
      };

      component['onTaskDrop'](dropEvent);

      expect(store.dispatch).toHaveBeenCalledWith(BoardActions.moveTask(dropEvent));
    });

    it('should correctly dispatch move between different columns', () => {
      const dropEvent = {
        sourceColumnIndex: 2,
        targetColumnIndex: 0,
        sourceTaskIndex: 1,
        targetTaskIndex: 2,
      };

      component['onTaskDrop'](dropEvent);

      expect(store.dispatch).toHaveBeenCalledWith(BoardActions.moveTask(dropEvent));
    });
  });

  describe('Store Integration', () => {
    it('should inject Store service', () => {
      expect(store).toBeTruthy();
    });

    it('should dispatch actions to store', () => {
      fixture.componentRef.setInput('currentBoard', mockBoard);
      fixture.detectChanges();

      const dropEvent = {
        sourceColumnIndex: 0,
        targetColumnIndex: 1,
        sourceTaskIndex: 0,
        targetTaskIndex: 0,
      };

      component['onTaskDrop'](dropEvent);

      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should use selectSignal selector from store', () => {
      const selectSignalSpy = store.selectSignal as jest.Mock;
      fixture.componentRef.setInput('currentBoard', null);
      fixture.detectChanges();

      component['onAddColumn']();

      expect(selectSignalSpy).toHaveBeenCalledWith(BoardSelectors.selectCurrentBoard);
    });
  });
});
