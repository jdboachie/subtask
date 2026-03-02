import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { NewTaskPage } from './new-task';
import { BoardActions, BoardSelectors } from '../../../../store';

const mockColumns = [
  { id: 'col-1', name: 'Todo', tasks: [] },
  { id: 'col-2', name: 'In Progress', tasks: [] },
  { id: 'col-3', name: 'Done', tasks: [] },
];

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  columns: mockColumns,
};

describe('NewTaskPage', () => {
  let fixture: any;
  let component: NewTaskPage;
  let store: Store;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTaskPage],
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            select: jest.fn().mockImplementation((selector) => {
              if (selector === BoardSelectors.selectColumns) {
                return of(mockColumns);
              }
              return of(null);
            }),
            selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(null)),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NewTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with title, description, status and subtasks', () => {
      expect(component['form'].get('title')).toBeTruthy();
      expect(component['form'].get('description')).toBeTruthy();
      expect(component['form'].get('status')).toBeTruthy();
      expect(component['form'].get('subtasks')).toBeTruthy();
    });

    it('should have isOpen signal set to true', () => {
      expect(component['isOpen']()).toBe(true);
    });

    it('should start with one empty subtask', () => {
      expect(component['subtasks'].length).toBe(1);
    });

    it('should have form invalid initially (title is required)', () => {
      expect(component['form'].invalid).toBe(true);
    });

    it('should load columns from store', () => {
      expect(store.select).toHaveBeenCalledWith(BoardSelectors.selectColumns);
    });
  });

  describe('Form Validation', () => {
    it('should require title', () => {
      const titleControl = component['form'].get('title');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should reject title longer than 60 characters', () => {
      component['form'].get('title')?.setValue('a'.repeat(61));
      expect(component['form'].get('title')?.hasError('maxlength')).toBe(true);
    });

    it('should accept valid title', () => {
      component['form'].get('title')?.setValue('My Task');
      expect(component['form'].get('title')?.valid).toBe(true);
    });

    it('should not require description', () => {
      component['form'].get('title')?.setValue('Task');
      component['form'].get('description')?.setValue('');
      component['subtasks'].at(0)?.setValue('Step');
      expect(component['form'].valid).toBe(true);
    });

    it('should mark all as touched on invalid submit', () => {
      component['onSubmit']();
      expect(component['form'].touched).toBe(true);
    });
  });

  describe('Subtask Management', () => {
    it('should add a new subtask', () => {
      const initial = component['subtasks'].length;
      component['addNewSubTask']();
      expect(component['subtasks'].length).toBe(initial + 1);
    });

    it('should add subtask with required validation', () => {
      component['addNewSubTask']();
      const last = component['subtasks'].at(component['subtasks'].length - 1);
      expect(last?.hasError('required')).toBe(true);
    });

    it('should remove a subtask at specified index', () => {
      component['addNewSubTask']();
      const initial = component['subtasks'].length;
      component['removeSubTask'](0);
      expect(component['subtasks'].length).toBe(initial - 1);
    });

    it('should not remove subtask when only one remains', () => {
      expect(component['subtasks'].length).toBe(1);
      component['removeSubTask'](0);
      expect(component['subtasks'].length).toBe(1);
    });

    it('should add multiple subtasks', () => {
      component['addNewSubTask']();
      component['addNewSubTask']();
      expect(component['subtasks'].length).toBe(3);
    });
  });

  describe('Close', () => {
    it('should set isOpen to false', () => {
      expect(component['isOpen']()).toBe(true);
      component['onClose']();
      expect(component['isOpen']()).toBe(false);
    });

    it('should navigate to board when current board exists', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(mockBoard));
      component['onClose']();
      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'board-1']);
    });

    it('should not navigate when no current board', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(null));
      const navigateSpy = router.navigate as jest.Mock;
      navigateSpy.mockClear();
      component['onClose']();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission - Success Path', () => {
    beforeEach(() => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(mockBoard));
    });

    it('should dispatch addTask with form values', () => {
      component['form'].get('title')?.setValue('New Task');
      component['form'].get('description')?.setValue('Some description');
      component['form'].get('status')?.setValue('Todo');
      component['subtasks'].at(0)?.setValue('Step 1');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.addTask({
          title: 'New Task',
          description: 'Some description',
          status: 'Todo',
          subtasks: [{ title: 'Step 1', isCompleted: false }],
        }),
      );
    });

    it('should trim whitespace from title', () => {
      component['form'].get('title')?.setValue('  My Task  ');
      component['form'].get('status')?.setValue('Todo');
      component['subtasks'].at(0)?.setValue('Step 1');

      component['onSubmit']();

      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.title).toBe('My Task');
    });

    it('should set isCompleted to false for all new subtasks', () => {
      component['form'].get('title')?.setValue('Task');
      component['form'].get('status')?.setValue('Todo');
      component['subtasks'].at(0)?.setValue('Subtask 1');
      component['addNewSubTask']();
      component['subtasks'].at(1)?.setValue('Subtask 2');

      component['onSubmit']();

      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.subtasks.every((s: any) => s.isCompleted === false)).toBe(true);
    });

    it('should call onClose after dispatch', () => {
      component['form'].get('title')?.setValue('Task');
      component['form'].get('status')?.setValue('Todo');
      component['subtasks'].at(0)?.setValue('Step');

      component['onSubmit']();

      expect(component['isOpen']()).toBe(false);
    });

    it('should navigate to board after submit', () => {
      component['form'].get('title')?.setValue('Task');
      component['form'].get('status')?.setValue('Todo');
      component['subtasks'].at(0)?.setValue('Step');

      component['onSubmit']();

      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'board-1']);
    });
  });

  describe('Form Submission - Error Handling', () => {
    it('should not dispatch when form is invalid', () => {
      (store.dispatch as jest.Mock).mockClear();
      component['onSubmit']();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should mark form touched on invalid submit', () => {
      component['onSubmit']();
      expect(component['form'].get('title')?.touched).toBe(true);
    });

    it('should not close when form is invalid', () => {
      component['onSubmit']();
      expect(component['isOpen']()).toBe(true);
    });
  });

  describe('Service Integration', () => {
    it('should use BoardSelectors.selectColumns when loading columns', () => {
      expect(store.select).toHaveBeenCalledWith(BoardSelectors.selectColumns);
    });

    it('should dispatch BoardActions.addTask on submit', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(mockBoard));
      component['form'].get('title')?.setValue('Task');
      component['form'].get('status')?.setValue('In Progress');
      component['subtasks'].at(0)?.setValue('Step');

      component['onSubmit']();

      const dispatchCall = (store.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchCall.status).toBe('In Progress');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete task creation workflow', () => {
      (store.selectSignal as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(mockBoard));

      component['form'].get('title')?.setValue('Feature Task');
      component['form'].get('description')?.setValue('Implement feature X');
      component['form'].get('status')?.setValue('In Progress');
      component['addNewSubTask']();
      component['subtasks'].at(0)?.setValue('Research');
      component['subtasks'].at(1)?.setValue('Implement');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.addTask({
          title: 'Feature Task',
          description: 'Implement feature X',
          status: 'In Progress',
          subtasks: [
            { title: 'Research', isCompleted: false },
            { title: 'Implement', isCompleted: false },
          ],
        }),
      );
      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'board-1']);
    });
  });
});
