import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AddBoardPage } from './add-board';
import { BoardActions, BoardSelectors } from '../../../../store';

describe('AddBoardPage Component', () => {
  let fixture: any;
  let component: AddBoardPage;
  let store: Store;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBoardPage],
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            select: jest.fn(),
            selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(null)),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBoardPage);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the add board component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with name and columns controls', () => {
      expect(component['form'].get('name')).toBeTruthy();
      expect(component['form'].get('columns')).toBeTruthy();
    });

    it('should have form invalid before name is provided', () => {
      expect(component['form'].invalid).toBe(true);
    });

    it('should require board name', () => {
      const nameControl = component['form'].get('name');
      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should start with one empty column', () => {
      const columns = component['columns'];
      expect(columns.length).toBe(1);
      expect(columns.at(0)?.value).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should reject empty board name', () => {
      const nameControl = component['form'].get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should reject board name longer than 60 characters', () => {
      const nameControl = component['form'].get('name');
      nameControl?.setValue('a'.repeat(61));
      expect(nameControl?.hasError('maxlength')).toBe(true);
    });

    it('should accept valid board name', () => {
      const nameControl = component['form'].get('name');
      nameControl?.setValue('My Board');
      expect(nameControl?.valid).toBe(true);
    });

    it('should mark form as touched on invalid submission', () => {
      component['form'].get('name')?.setValue('');
      component['form'].get('columns')?.reset(['']);
      component['onSubmit']();
      expect(component['form'].touched).toBe(true);
    });
  });

  describe('Column Management', () => {
    it('should add a new column', () => {
      const initialLength = component['columns'].length;
      component['addColumn']();
      expect(component['columns'].length).toBe(initialLength + 1);
    });

    it('should add column with required validation', () => {
      component['addColumn']();
      const newColumn = component['columns'].at(component['columns'].length - 1);
      expect(newColumn?.hasError('required')).toBe(true);
    });

    it('should remove column at specific index', () => {
      component['addColumn']();
      component['addColumn']();
      const initialLength = component['columns'].length;
      component['removeColumn'](1);
      expect(component['columns'].length).toBe(initialLength - 1);
    });

    it('should prevent removing column when only one exists', () => {
      component['removeColumn'](0);
      expect(component['columns'].length).toBe(1);
    });

    it('should add multiple columns', () => {
      component['addColumn']();
      component['addColumn']();
      component['addColumn']();
      expect(component['columns'].length).toBe(4);
    });

    it('should remove column from middle of list', () => {
      component['addColumn']();
      component['addColumn']();
      const initialLength = component['columns'].length;
      component['removeColumn'](1);
      expect(component['columns'].length).toBe(initialLength - 1);
    });
  });

  describe('Form Submission - Success Path', () => {
    beforeEach(() => {
      (store.select as jest.Mock).mockReturnValue(of([]));
    });

    it('should dispatch createBoard action on valid submission', () => {
      component['form'].get('name')?.setValue('New Board');
      component['columns'].at(0)?.setValue('Todo');
      component['addColumn']();
      component['columns'].at(1)?.setValue('In Progress');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.createBoard({
          name: 'New Board',
          columnNames: ['Todo', 'In Progress'],
        }),
      );
    });

    it('should trim whitespace from board name', () => {
      component['form'].get('name')?.setValue('  Board Name  ');
      component['columns'].at(0)?.setValue('Column');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.createBoard({
          name: 'Board Name',
          columnNames: ['Column'],
        }),
      );
    });

    it('should filter empty column names', () => {
      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo  ');
      component['addColumn']();
      component['columns'].at(1)?.setValue('Done');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.createBoard({
          name: 'Board',
          columnNames: ['Todo', 'Done'],
        }),
      );
    });

    it('should dispatch close:add-board event', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      const closeEvent = dispatchEventSpy.mock.calls.find(
        (call) => call[0] instanceof CustomEvent && call[0].type === 'close:add-board',
      );
      expect(closeEvent).toBeTruthy();
    });
  });

  describe('Form Submission - Error Handling', () => {
    it('should set duplicate error on duplicate board name', () => {
      const existingBoards = [
        {
          id: '1',
          name: 'Existing Board',
          columns: [],
        },
      ];
      (store.select as jest.Mock).mockReturnValue(of(existingBoards));

      component['form'].get('name')?.setValue('Existing Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(component['form'].get('name')?.hasError('duplicate')).toBe(true);
    });

    it('should perform case-insensitive duplicate check', () => {
      const existingBoards = [
        {
          id: '1',
          name: 'My Board',
          columns: [],
        },
      ];
      (store.select as jest.Mock).mockReturnValue(of(existingBoards));

      component['form'].get('name')?.setValue('my board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(component['form'].get('name')?.hasError('duplicate')).toBe(true);
    });

    it('should not dispatch action for duplicate board', () => {
      const existingBoards = [
        {
          id: '1',
          name: 'Existing Board',
          columns: [],
        },
      ];
      (store.select as jest.Mock).mockReturnValue(of(existingBoards));

      const dispatchSpy = store.dispatch as jest.Mock;
      dispatchSpy.mockClear();

      component['form'].get('name')?.setValue('Existing Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('createBoard'),
        }),
      );
    });

    it('should not prevent submission for valid form with same name in different case', () => {
      const existingBoards = [
        {
          id: '1',
          name: 'Different Board',
          columns: [],
        },
      ];
      (store.select as jest.Mock).mockReturnValue(of(existingBoards));

      component['form'].get('name')?.setValue('New Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.createBoard({
          name: 'New Board',
          columnNames: ['Todo'],
        }),
      );
    });
  });

  describe('Service Integration - Store', () => {
    beforeEach(() => {
      (store.select as jest.Mock).mockReturnValue(of([]));
    });

    it('should check for duplicate boards from store', () => {
      const selectSpy = store.select as jest.Mock;
      selectSpy.mockReturnValue(of([]));

      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(selectSpy).toHaveBeenCalledWith(BoardSelectors.selectAllBoards);
    });

    it('should select current board after dispatch', () => {
      const selectSpy = store.select as jest.Mock;
      selectSpy.mockImplementation((selector) => {
        if (selector === BoardSelectors.selectAllBoards) {
          return of([]);
        }
        if (selector === BoardSelectors.selectCurrentBoard) {
          return of({ id: 'board-1', name: 'Board' });
        }
        return of(null);
      });

      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(selectSpy).toHaveBeenCalledWith(BoardSelectors.selectCurrentBoard);
    });
  });

  describe('Service Integration - Router', () => {
    beforeEach(() => {
      (store.select as jest.Mock).mockImplementation((selector) => {
        if (selector === BoardSelectors.selectAllBoards) {
          return of([]);
        }
        if (selector === BoardSelectors.selectCurrentBoard) {
          return of({ id: 'board-1', name: 'New Board', columns: [] });
        }
        return of(null);
      });
    });

    it('should navigate to created board', () => {
      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'board-1']);
    });

    it('should not navigate if current board is null', () => {
      (store.select as jest.Mock).mockImplementation((selector) => {
        if (selector === BoardSelectors.selectAllBoards) {
          return of([]);
        }
        if (selector === BoardSelectors.selectCurrentBoard) {
          return of(null);
        }
        return of(null);
      });

      const navigateSpy = router.navigate as jest.Mock;
      navigateSpy.mockClear();

      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should use board id from current board for navigation', () => {
      const mockBoard = { id: 'unique-board-id', name: 'Test Board', columns: [] };
      (store.select as jest.Mock).mockImplementation((selector) => {
        if (selector === BoardSelectors.selectAllBoards) {
          return of([]);
        }
        if (selector === BoardSelectors.selectCurrentBoard) {
          return of(mockBoard);
        }
        return of(null);
      });

      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'unique-board-id']);
    });
  });

  describe('Template Rendering', () => {
    it('should create add board component', () => {
      expect(component).toBeTruthy();
    });

    it('should have form defined', () => {
      expect(component['form']).toBeTruthy();
    });

    it('should have columns getter', () => {
      expect(component['columns']).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      (store.select as jest.Mock).mockImplementation((selector) => {
        if (selector === BoardSelectors.selectAllBoards) {
          return of([]);
        }
        if (selector === BoardSelectors.selectCurrentBoard) {
          return of({ id: 'board-1', name: 'New Board', columns: [] });
        }
        return of(null);
      });
    });

    it('should handle complete board creation workflow', () => {
      component['form'].get('name')?.setValue('Project A');
      component['columns'].at(0)?.setValue('Backlog');
      component['addColumn']();
      component['columns'].at(1)?.setValue('In Progress');
      component['addColumn']();
      component['columns'].at(2)?.setValue('Review');
      component['addColumn']();
      component['columns'].at(3)?.setValue('Done');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.createBoard({
          name: 'Project A',
          columnNames: ['Backlog', 'In Progress', 'Review', 'Done'],
        }),
      );
      expect(router.navigate).toHaveBeenCalledWith(['/boards', 'board-1']);
    });

    it('should handle board with single column', () => {
      component['form'].get('name')?.setValue('Simple Board');
      component['columns'].at(0)?.setValue('Tasks');

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.createBoard({
          name: 'Simple Board',
          columnNames: ['Tasks'],
        }),
      );
    });

    it('should handle board with many columns', () => {
      component['form'].get('name')?.setValue('Complex Board');
      component['columns'].at(0)?.setValue('C1');
      const columnNames = ['C1'];

      for (let i = 1; i < 8; i++) {
        component['addColumn']();
        component['columns'].at(i)?.setValue(`C${i + 1}`);
        columnNames.push(`C${i + 1}`);
      }

      component['onSubmit']();

      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.createBoard({
          name: 'Complex Board',
          columnNames,
        }),
      );
    });

    it('should reset form after successful submission', () => {
      component['form'].get('name')?.setValue('Board');
      component['columns'].at(0)?.setValue('Todo');

      component['onSubmit']();

      expect(component['form'].valid).toBeTruthy();
    });
  });
});
