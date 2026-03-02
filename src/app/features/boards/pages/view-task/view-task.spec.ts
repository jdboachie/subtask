import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ViewTaskPage } from './view-task';
import { BoardActions } from '../../../../store';
import type { Task } from '../../../../ui/board/board.model';

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task description',
  status: 'Todo',
  subtasks: [
    { title: 'Subtask 1', isCompleted: false },
    { title: 'Subtask 2', isCompleted: true },
    { title: 'Subtask 3', isCompleted: false },
  ],
};

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  columns: [
    { id: 'col-1', name: 'Todo', tasks: [] },
    { id: 'col-2', name: 'In Progress', tasks: [] },
    { id: 'col-3', name: 'Done', tasks: [] },
  ],
};

describe('ViewTaskPage', () => {
  let fixture: any;
  let component: ViewTaskPage;
  let store: Store;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTaskPage],
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            select: jest.fn(),
            selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(null)),
          },
        },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: {}, params: of({}), queryParams: of({}) },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ViewTaskPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'task-1');
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should require id input', () => {
      expect(component.id()).toBe('task-1');
    });

    it('should have isOpen signal set to true initially', () => {
      expect(component['isOpen']()).toBe(true);
    });

    it('should call selectSignal on init to load task', () => {
      expect(store.selectSignal).toHaveBeenCalled();
    });
  });

  describe('Computed Properties - no task', () => {
    it('should return 0 for completedCount when task is null', () => {
      component['task'].set(null);
      expect(component['completedCount']()).toBe(0);
    });

    it('should return 0 for totalCount when task is null', () => {
      component['task'].set(null);
      expect(component['totalCount']()).toBe(0);
    });
  });

  describe('Computed Properties - with task', () => {
    beforeEach(() => {
      component['task'].set(mockTask);
    });

    it('should compute completedCount from subtasks', () => {
      expect(component['completedCount']()).toBe(1);
    });

    it('should compute totalCount from subtasks', () => {
      expect(component['totalCount']()).toBe(3);
    });

    it('should return 0 completedCount when all subtasks are incomplete', () => {
      const t: Task = {
        ...mockTask,
        subtasks: [
          { title: 'A', isCompleted: false },
          { title: 'B', isCompleted: false },
        ],
      };
      component['task'].set(t);
      expect(component['completedCount']()).toBe(0);
    });

    it('should return full count when all subtasks are completed', () => {
      const t: Task = {
        ...mockTask,
        subtasks: [
          { title: 'A', isCompleted: true },
          { title: 'B', isCompleted: true },
        ],
      };
      component['task'].set(t);
      expect(component['completedCount']()).toBe(2);
      expect(component['totalCount']()).toBe(2);
    });
  });

  describe('Columns', () => {
    it('should return empty array when board is null', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(null));
      expect(component['columns']()).toEqual([]);
    });

    it('should return board columns when board exists', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(mockBoard));
      expect(component['columns']()).toEqual(mockBoard.columns);
    });
  });

  describe('Toggle Subtask', () => {
    beforeEach(() => {
      component['task'].set(mockTask);
    });

    it('should dispatch updateTask when toggling a subtask', () => {
      component['toggleSubtask'](0);
      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.updateTask({
          taskId: 'task-1',
          status: 'Todo',
          title: 'Test Task',
          description: 'A test task description',
          subtasks: [
            { title: 'Subtask 1', isCompleted: true },
            { title: 'Subtask 2', isCompleted: true },
            { title: 'Subtask 3', isCompleted: false },
          ],
        }),
      );
    });

    it('should toggle completed subtask to incomplete', () => {
      component['toggleSubtask'](1);
      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.updateTask({
          taskId: 'task-1',
          status: 'Todo',
          title: 'Test Task',
          description: 'A test task description',
          subtasks: [
            { title: 'Subtask 1', isCompleted: false },
            { title: 'Subtask 2', isCompleted: false },
            { title: 'Subtask 3', isCompleted: false },
          ],
        }),
      );
    });

    it('should not dispatch when task is null', () => {
      component['task'].set(null);
      (store.dispatch as jest.Mock).mockClear();
      component['toggleSubtask'](0);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should use current task id from input', () => {
      component['toggleSubtask'](0);
      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.taskId).toBe('task-1');
    });

    it('should only toggle the specified subtask index', () => {
      component['toggleSubtask'](2);
      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.subtasks[0].isCompleted).toBe(false);
      expect(dispatchCall.subtasks[1].isCompleted).toBe(true);
      expect(dispatchCall.subtasks[2].isCompleted).toBe(true);
    });
  });

  describe('Change Status', () => {
    beforeEach(() => {
      component['task'].set(mockTask);
    });

    it('should dispatch updateTask when changing status', () => {
      component['changeStatus']('In Progress');
      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.updateTask({
          taskId: 'task-1',
          status: 'In Progress',
          title: 'Test Task',
          description: 'A test task description',
          subtasks: mockTask.subtasks,
        }),
      );
    });

    it('should not dispatch when task is null', () => {
      component['task'].set(null);
      (store.dispatch as jest.Mock).mockClear();
      component['changeStatus']('Done');
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should preserve task title when changing status', () => {
      component['changeStatus']('Done');
      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.title).toBe('Test Task');
    });

    it('should preserve task subtasks when changing status', () => {
      component['changeStatus']('Done');
      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.subtasks).toEqual(mockTask.subtasks);
    });

    it('should use new status in dispatch', () => {
      component['changeStatus']('Archived');
      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.status).toBe('Archived');
    });
  });

  describe('Close', () => {
    it('should set isOpen to false on close', () => {
      expect(component['isOpen']()).toBe(true);
      component['onClose']();
      expect(component['isOpen']()).toBe(false);
    });

    it('should navigate to board when current board exists', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(mockBoard));
      component['onClose']();
      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'board-1']);
    });

    it('should navigate to /boards when no current board', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(null));
      component['onClose']();
      expect(router.navigate).toHaveBeenCalledWith(['/boards']);
    });
  });

  describe('Integration Tests', () => {
    it('should handle full subtask toggle workflow', () => {
      const task: Task = {
        id: 'task-2',
        title: 'Integration Task',
        description: '',
        status: 'Todo',
        subtasks: [{ title: 'Step 1', isCompleted: false }],
      };
      component['task'].set(task);
      fixture.componentRef.setInput('id', 'task-2');

      component['toggleSubtask'](0);

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.updateTask({
          taskId: 'task-2',
          status: 'Todo',
          title: 'Integration Task',
          description: '',
          subtasks: [{ title: 'Step 1', isCompleted: true }],
        }),
      );
    });

    it('should handle full status change and close workflow', () => {
      component['task'].set(mockTask);
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(mockBoard));

      component['changeStatus']('Done');
      component['onClose']();

      expect(store.dispatch).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'board-1']);
    });
  });
});
