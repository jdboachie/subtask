import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { BoardDetailsPage } from './board-details';
import { BoardActions, BoardSelectors } from '../../../../store';

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  columns: [
    { id: 'col-1', name: 'Todo', tasks: [] },
    { id: 'col-2', name: 'In Progress', tasks: [] },
    { id: 'col-3', name: 'Done', tasks: [] },
  ],
};

describe('BoardDetailsPage', () => {
  let fixture: any;
  let component: BoardDetailsPage;
  let store: Store;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardDetailsPage],
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            select: jest.fn().mockImplementation((selector) => {
              if (selector === BoardSelectors.selectIsLoading) {
                return of(false);
              }
              if (selector === BoardSelectors.selectColumnNames) {
                return of(['Todo', 'In Progress', 'Done']);
              }
              if (selector === BoardSelectors.selectCurrentBoard) {
                return of(mockBoard);
              }
              return of(null);
            }),
            selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(null)),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn().mockResolvedValue(true),
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(BoardDetailsPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'board-1');
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should require id input', () => {
      expect(component.id()).toBe('board-1');
    });

    it('should have filter input defaulting to null', () => {
      expect(component.filter()).toBeNull();
    });

    it('should dispatch selectBoardById on init', () => {
      expect(store.dispatch).toHaveBeenCalledWith(BoardActions.selectBoardById({ id: 'board-1' }));
    });

    it('should start with dirty flag false', () => {
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should load column names from store', () => {
      expect(store.select).toHaveBeenCalledWith(BoardSelectors.selectColumnNames);
    });

    it('should load loading state from store', () => {
      expect(store.select).toHaveBeenCalledWith(BoardSelectors.selectIsLoading);
    });
  });

  describe('Inputs', () => {
    it('should update when id input changes', () => {
      fixture.componentRef.setInput('id', 'board-2');
      fixture.detectChanges();
      expect(store.dispatch).toHaveBeenCalledWith(BoardActions.selectBoardById({ id: 'board-2' }));
    });

    it('should accept filter input', () => {
      fixture.componentRef.setInput('filter', 'Todo');
      fixture.detectChanges();
      expect(component.filter()).toBe('Todo');
    });

    it('should handle null filter input', () => {
      fixture.componentRef.setInput('filter', null);
      fixture.detectChanges();
      expect(component.filter()).toBeNull();
    });
  });

  describe('hasUnsavedChanges', () => {
    it('should return false initially', () => {
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should return true after onAddColumn is called', () => {
      component['onAddColumn']();
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should return true after onTaskMoved is called', () => {
      component['onTaskMoved']();
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should reset dirty flag when id changes', () => {
      component['onAddColumn']();
      expect(component.hasUnsavedChanges()).toBe(true);
      fixture.componentRef.setInput('id', 'board-2');
      fixture.detectChanges();
      expect(component.hasUnsavedChanges()).toBe(false);
    });
  });

  describe('onAddColumn', () => {
    it('should set dirty flag', () => {
      component['onAddColumn']();
      expect(component['dirty']()).toBe(true);
    });
  });

  describe('onTaskMoved', () => {
    it('should set dirty flag', () => {
      component['onTaskMoved']();
      expect(component['dirty']()).toBe(true);
    });
  });

  describe('onFilterChange', () => {
    it('should navigate with filter query param when filter given', () => {
      component['onFilterChange']('Todo');
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { filter: 'Todo' },
        queryParamsHandling: 'merge',
      });
    });

    it('should navigate with null queryParamsHandling when filter is null', () => {
      component['onFilterChange'](null);
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { filter: null },
        queryParamsHandling: null,
      });
    });

    it('should navigate to same route (empty array) for filter change', () => {
      component['onFilterChange']('Done');
      const navCall = (router.navigate as jest.Mock).mock.calls[0];
      expect(navCall[0]).toEqual([]);
    });
  });

  describe('Store Integration', () => {
    it('should dispatch selectBoardById with correct id', () => {
      fixture.componentRef.setInput('id', 'specific-id');
      fixture.detectChanges();
      expect(store.dispatch).toHaveBeenCalledWith(
        BoardActions.selectBoardById({ id: 'specific-id' }),
      );
    });

    it('should use BoardSelectors.selectIsLoading', () => {
      expect(store.select).toHaveBeenCalledWith(BoardSelectors.selectIsLoading);
    });

    it('should use BoardSelectors.selectColumnNames', () => {
      expect(store.select).toHaveBeenCalledWith(BoardSelectors.selectColumnNames);
    });

    it('should use BoardSelectors.selectCurrentBoard', () => {
      expect(store.select).toHaveBeenCalledWith(BoardSelectors.selectCurrentBoard);
    });
  });

  describe('Integration Tests', () => {
    it('should handle board selection and unsaved changes workflow', () => {
      expect(component.hasUnsavedChanges()).toBe(false);

      component['onTaskMoved']();
      expect(component.hasUnsavedChanges()).toBe(true);

      fixture.componentRef.setInput('id', 'board-2');
      fixture.detectChanges();
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should handle filter change workflow', () => {
      component['onFilterChange']('In Progress');
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { filter: 'In Progress' },
        queryParamsHandling: 'merge',
      });

      component['onFilterChange'](null);
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { filter: null },
        queryParamsHandling: null,
      });
    });
  });
});
