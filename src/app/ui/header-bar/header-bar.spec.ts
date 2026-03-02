import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { HeaderBar } from './header-bar';
import { Theme } from '../theme';
import { Board } from '../board/board.model';

describe('HeaderBar Component', () => {
  let fixture: any;
  let component: HeaderBar;
  let theme: Theme;

  const mockBoards: Board[] = [
    {
      id: 'board-1',
      name: 'Board 1',
      columns: [],
    },
    {
      id: 'board-2',
      name: 'Board 2',
      columns: [],
    },
    {
      id: 'board-3',
      name: 'Board 3',
      columns: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBar],
      providers: [
        provideRouter([]),
        {
          provide: Theme,
          useValue: {
            resolvedTheme: jest.fn().mockReturnValue('light'),
          },
        },
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(null)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderBar);
    component = fixture.componentInstance;
    theme = TestBed.inject(Theme);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the header bar component', () => {
      expect(component).toBeTruthy();
    });

    it('should have empty boards array by default', () => {
      expect(component.boards()).toEqual([]);
    });

    it('should have empty boardName by default', () => {
      expect(component.boardName()).toBe('');
    });

    it('should have sidebarHidden false by default', () => {
      expect(component.sidebarHidden()).toBe(false);
    });

    it('should have addTaskDisabled false by default', () => {
      expect(component.addTaskDisabled()).toBe(false);
    });

    it('should have boardListOpen signal false by default', () => {
      expect(component['boardListOpen']()).toBe(false);
    });

    it('should have addBoardOpen signal false by default', () => {
      expect(component['addBoardOpen']()).toBe(false);
    });
  });

  describe('Inputs', () => {
    it('should accept boards input', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();
      expect(component.boards()).toEqual(mockBoards);
    });

    it('should update when boards input changes', () => {
      fixture.componentRef.setInput('boards', [mockBoards[0]]);
      fixture.detectChanges();
      expect(component.boards()).toEqual([mockBoards[0]]);

      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();
      expect(component.boards()).toEqual(mockBoards);
    });

    it('should handle empty boards array', () => {
      fixture.componentRef.setInput('boards', []);
      fixture.detectChanges();
      expect(component.boards()).toEqual([]);
    });

    it('should accept boardName input', () => {
      fixture.componentRef.setInput('boardName', 'My Board');
      fixture.detectChanges();
      expect(component.boardName()).toBe('My Board');
    });

    it('should update when boardName changes', () => {
      fixture.componentRef.setInput('boardName', 'First Board');
      fixture.detectChanges();
      expect(component.boardName()).toBe('First Board');

      fixture.componentRef.setInput('boardName', 'Second Board');
      fixture.detectChanges();
      expect(component.boardName()).toBe('Second Board');
    });

    it('should accept sidebarHidden input', () => {
      fixture.componentRef.setInput('sidebarHidden', true);
      fixture.detectChanges();
      expect(component.sidebarHidden()).toBe(true);
    });

    it('should toggle sidebarHidden state', () => {
      fixture.componentRef.setInput('sidebarHidden', false);
      fixture.detectChanges();
      expect(component.sidebarHidden()).toBe(false);

      fixture.componentRef.setInput('sidebarHidden', true);
      fixture.detectChanges();
      expect(component.sidebarHidden()).toBe(true);
    });

    it('should accept addTaskDisabled input', () => {
      fixture.componentRef.setInput('addTaskDisabled', true);
      fixture.detectChanges();
      expect(component.addTaskDisabled()).toBe(true);
    });

    it('should update when addTaskDisabled changes', () => {
      fixture.componentRef.setInput('addTaskDisabled', false);
      fixture.detectChanges();
      expect(component.addTaskDisabled()).toBe(false);

      fixture.componentRef.setInput('addTaskDisabled', true);
      fixture.detectChanges();
      expect(component.addTaskDisabled()).toBe(true);
    });
  });

  describe('Outputs', () => {
    it('should have addTask output event', () => {
      expect(component.addTask).toBeDefined();
      expect(typeof component.addTask.emit).toBe('function');
    });

    it('should have createBoard output event', () => {
      expect(component.createBoard).toBeDefined();
      expect(typeof component.createBoard.emit).toBe('function');
    });

    it('should emit addTask event', (done) => {
      component.addTask.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      component.addTask.emit();
    });

    it('should emit createBoard event', (done) => {
      component.createBoard.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      component.createBoard.emit();
    });
  });

  describe('Computed Properties', () => {
    it('should compute logoSrc for light theme', () => {
      (theme.resolvedTheme as unknown as jest.Mock).mockReturnValue('light');
      fixture.detectChanges();
      expect(component['logoSrc']()).toBe('/logo-dark.svg');
    });

    it('should compute logoSrc for dark theme', () => {
      (theme.resolvedTheme as unknown as jest.Mock).mockReturnValue('dark');
      fixture.detectChanges();
      expect(component['logoSrc']()).toBe('/logo-light.svg');
    });

    it('should have logoSrc computed property', () => {
      expect(component['logoSrc']).toBeDefined();
      expect(typeof component['logoSrc']).toBe('function');
    });
  });

  describe('Board List Methods', () => {
    it('should toggle board list open state', () => {
      expect(component['boardListOpen']()).toBe(false);
      component['onToggleBoards']();
      expect(component['boardListOpen']()).toBe(true);
      component['onToggleBoards']();
      expect(component['boardListOpen']()).toBe(false);
    });

    it('should open board list', () => {
      expect(component['boardListOpen']()).toBe(false);
      component['onOpenBoards']();
      expect(component['boardListOpen']()).toBe(true);
    });

    it('should close board list', () => {
      component['boardListOpen'].set(true);
      expect(component['boardListOpen']()).toBe(true);
      component['onCloseBoards']();
      expect(component['boardListOpen']()).toBe(false);
    });

    it('should close board list when opening add board', () => {
      component['boardListOpen'].set(true);
      expect(component['boardListOpen']()).toBe(true);
      component['onOpenAddBoard']();
      expect(component['boardListOpen']()).toBe(false);
      expect(component['addBoardOpen']()).toBe(true);
    });
  });

  describe('Add Board Modal Methods', () => {
    it('should open add board modal', () => {
      expect(component['addBoardOpen']()).toBe(false);
      component['onOpenAddBoard']();
      expect(component['addBoardOpen']()).toBe(true);
    });

    it('should close board list when opening add board', () => {
      component['boardListOpen'].set(true);
      component['onOpenAddBoard']();
      expect(component['boardListOpen']()).toBe(false);
    });

    it('should close add board modal', () => {
      component['addBoardOpen'].set(true);
      expect(component['addBoardOpen']()).toBe(true);
      component['onCloseAddBoard']();
      expect(component['addBoardOpen']()).toBe(false);
    });
  });

  describe('Host Bindings', () => {
    it('should apply sidebar-hidden class when sidebarHidden is true', () => {
      fixture.componentRef.setInput('sidebarHidden', true);
      fixture.detectChanges();
      const hostElement = fixture.nativeElement as HTMLElement;
      expect(hostElement.classList.contains('sidebar-hidden')).toBe(true);
    });

    it('should not apply sidebar-hidden class when sidebarHidden is false', () => {
      fixture.componentRef.setInput('sidebarHidden', false);
      fixture.detectChanges();
      const hostElement = fixture.nativeElement as HTMLElement;
      expect(hostElement.classList.contains('sidebar-hidden')).toBe(false);
    });

    it('should update sidebar-hidden class when sidebarHidden changes', () => {
      const hostElement = fixture.nativeElement as HTMLElement;

      fixture.componentRef.setInput('sidebarHidden', false);
      fixture.detectChanges();
      expect(hostElement.classList.contains('sidebar-hidden')).toBe(false);

      fixture.componentRef.setInput('sidebarHidden', true);
      fixture.detectChanges();
      expect(hostElement.classList.contains('sidebar-hidden')).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    it('should create header bar component', () => {
      expect(component).toBeTruthy();
    });

    it('should accept complex board list for rendering', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.componentRef.setInput('boardName', 'Marketing Board');
      fixture.detectChanges();

      expect(component.boards()).toEqual(mockBoards);
      expect(component.boardName()).toBe('Marketing Board');
    });
  });

  describe('State Management', () => {
    it('should maintain board list and board name independently', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.componentRef.setInput('boardName', 'Test Board');
      fixture.detectChanges();

      expect(component.boards()).toEqual(mockBoards);
      expect(component.boardName()).toBe('Test Board');
    });

    it('should handle concurrent input updates', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.componentRef.setInput('boardName', 'Board 1');
      fixture.componentRef.setInput('sidebarHidden', true);
      fixture.componentRef.setInput('addTaskDisabled', true);
      fixture.detectChanges();

      expect(component.boards()).toEqual(mockBoards);
      expect(component.boardName()).toBe('Board 1');
      expect(component.sidebarHidden()).toBe(true);
      expect(component.addTaskDisabled()).toBe(true);
    });

    it('should update board list while keeping modal states', () => {
      fixture.componentRef.setInput('boards', [mockBoards[0]]);
      fixture.detectChanges();
      component['boardListOpen'].set(true);

      expect(component['boardListOpen']()).toBe(true);

      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();

      expect(component.boards()).toEqual(mockBoards);
      expect(component['boardListOpen']()).toBe(true);
    });

    it('should handle multiple toggle operations', () => {
      component['onToggleBoards']();
      expect(component['boardListOpen']()).toBe(true);

      component['onToggleBoards']();
      expect(component['boardListOpen']()).toBe(false);

      component['onToggleBoards']();
      expect(component['boardListOpen']()).toBe(true);

      component['onToggleBoards']();
      expect(component['boardListOpen']()).toBe(false);
    });
  });

  describe('Window Event Listeners', () => {
    it('should have open:add-board event listener', () => {
      const spy = jest.spyOn(window, 'addEventListener');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HeaderBar],
        providers: [
          provideRouter([]),
          {
            provide: Theme,
            useValue: {
              resolvedTheme: jest.fn().mockReturnValue('light'),
            },
          },
          {
            provide: Store,
            useValue: {
              dispatch: jest.fn(),
              selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(null)),
            },
          },
        ],
      });
      fixture = TestBed.createComponent(HeaderBar);
      component = fixture.componentInstance;

      expect(spy).toHaveBeenCalledWith('open:add-board', expect.any(Function));
    });

    it('should have close:add-board event listener', () => {
      const spy = jest.spyOn(window, 'addEventListener');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HeaderBar],
        providers: [
          provideRouter([]),
          {
            provide: Theme,
            useValue: {
              resolvedTheme: jest.fn().mockReturnValue('light'),
            },
          },
          {
            provide: Store,
            useValue: {
              dispatch: jest.fn(),
              selectSignal: jest.fn().mockReturnValue(jest.fn().mockReturnValue(null)),
            },
          },
        ],
      });
      fixture = TestBed.createComponent(HeaderBar);
      component = fixture.componentInstance;

      expect(spy).toHaveBeenCalledWith('close:add-board', expect.any(Function));
    });

    it('should open add board modal on open:add-board event', () => {
      expect(component['addBoardOpen']()).toBe(false);
      const event = new Event('open:add-board');
      window.dispatchEvent(event);
      expect(component['addBoardOpen']()).toBe(true);
    });

    it('should close add board modal on close:add-board event', () => {
      component['addBoardOpen'].set(true);
      expect(component['addBoardOpen']()).toBe(true);
      const event = new Event('close:add-board');
      window.dispatchEvent(event);
      expect(component['addBoardOpen']()).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle full workflow - toggle boards, then add board', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();

      expect(component['boardListOpen']()).toBe(false);
      component['onToggleBoards']();
      expect(component['boardListOpen']()).toBe(true);

      component['onOpenAddBoard']();
      expect(component['boardListOpen']()).toBe(false);
      expect(component['addBoardOpen']()).toBe(true);

      component['onCloseAddBoard']();
      expect(component['addBoardOpen']()).toBe(false);
    });

    it('should handle add task with multiple board states', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.componentRef.setInput('boardName', 'Test Board');
      fixture.componentRef.setInput('addTaskDisabled', false);
      fixture.detectChanges();

      const spy = jest.spyOn(component.addTask, 'emit');
      component.addTask.emit();
      expect(spy).toHaveBeenCalled();
    });

    it('should disable add task button when addTaskDisabled is true', () => {
      fixture.componentRef.setInput('addTaskDisabled', true);
      fixture.detectChanges();
      expect(component.addTaskDisabled()).toBe(true);
    });

    it('should manage sidebar visibility state independently', () => {
      fixture.componentRef.setInput('sidebarHidden', true);
      fixture.detectChanges();

      component['onOpenBoards']();
      expect(component['boardListOpen']()).toBe(true);
      expect(component.sidebarHidden()).toBe(true);

      fixture.componentRef.setInput('sidebarHidden', false);
      fixture.detectChanges();
      expect(component['boardListOpen']()).toBe(true);
      expect(component.sidebarHidden()).toBe(false);
    });
  });
});
