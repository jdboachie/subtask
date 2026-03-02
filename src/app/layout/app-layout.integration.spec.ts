import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { AppLayout } from './app-layout';
import { Sidebar } from '../ui/sidebar/sidebar';
import { HeaderBar } from '../ui/header-bar/header-bar';
import { LocalSync } from '../services/local-sync';
import { Board } from '../ui/board/board.model';

const mockBoards: Board[] = [
  { id: 'b1', name: 'Platform Launch', columns: [{ name: 'Todo', tasks: [] }] },
  { id: 'b2', name: 'Marketing Plan', columns: [] },
];

const initialState = {
  boards: {
    boards: mockBoards,
    boardsOverride: null,
    selectedBoardId: null,
    isLoading: false,
    error: null,
  },
  auth: {
    user: null,
    isLoading: false,
    error: null,
  },
};

describe('AppLayout Integration (AppLayout + Sidebar + HeaderBar)', () => {
  let fixture: any;
  let component: AppLayout;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayout],
      providers: [
        provideMockStore({ initialState }),
        provideRouter([]),
        { provide: LocalSync, useValue: { init: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllMocks();
  });

  describe('Store data flows to child components', () => {
    it('renders the Sidebar component', () => {
      const sidebar = fixture.debugElement.query(By.directive(Sidebar));
      expect(sidebar).toBeTruthy();
    });

    it('passes the boards list from the store to Sidebar', () => {
      const sidebarDE = fixture.debugElement.query(By.directive(Sidebar));
      expect(sidebarDE.componentInstance.boards()).toEqual(mockBoards);
    });

    it('renders the correct number of boards in the sidebar nav heading', () => {
      const navHeading = fixture.nativeElement.querySelector('.nav-heading');
      expect(navHeading.textContent).toContain('ALL BOARDS (2)');
    });

    it('renders a board link for each board in the sidebar', () => {
      const boardLinks = fixture.nativeElement.querySelectorAll('a[app-sidebar-button]');
      expect(boardLinks).toHaveLength(2);
    });

    it('renders the board names in the sidebar links', () => {
      const boardLinks = Array.from(
        fixture.nativeElement.querySelectorAll('a[app-sidebar-button]'),
      ) as HTMLElement[];
      const names = boardLinks.map((el) => el.textContent?.trim());
      expect(names).toContain('Platform Launch');
      expect(names).toContain('Marketing Plan');
    });

    it('passes the current board name to HeaderBar', () => {
      const headerBarDE = fixture.debugElement.query(By.directive(HeaderBar));
      expect(headerBarDE.componentInstance.boardName()).toBe('Platform Launch');
    });

    it('renders the current board title in the header', () => {
      const title = fixture.nativeElement.querySelector('.board-title');
      expect(title.textContent).toContain('Platform Launch');
    });
  });

  describe('Sidebar show / hide interaction', () => {
    it('sidebar is visible initially', () => {
      const sidebar = fixture.nativeElement.querySelector('app-sidebar');
      expect(sidebar.getAttribute('data-hidden')).toBe('false');
    });

    it('does not show the show-sidebar button when sidebar is visible', () => {
      const btn = fixture.nativeElement.querySelector('button[app-show-sidebar-button]');
      expect(btn).toBeNull();
    });

    it('hides the sidebar when the hide button is clicked', () => {
      const hideBtn = fixture.nativeElement.querySelector('.hide-button') as HTMLElement;
      hideBtn.click();
      fixture.detectChanges();

      const sidebar = fixture.nativeElement.querySelector('app-sidebar');
      expect(sidebar.getAttribute('data-hidden')).toBe('true');
    });

    it('shows the show-sidebar button after the sidebar is hidden', () => {
      const hideBtn = fixture.nativeElement.querySelector('.hide-button') as HTMLElement;
      hideBtn.click();
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button[app-show-sidebar-button]');
      expect(btn).toBeTruthy();
    });

    it('restores the sidebar when the show-sidebar button is clicked', () => {
      component.sidebarHidden.set(true);
      fixture.detectChanges();

      const showBtn = fixture.nativeElement.querySelector(
        'button[app-show-sidebar-button]',
      ) as HTMLElement;
      showBtn.click();
      fixture.detectChanges();

      const sidebar = fixture.nativeElement.querySelector('app-sidebar');
      expect(sidebar.getAttribute('data-hidden')).toBe('false');
    });

    it('removes the show-sidebar button once the sidebar is shown again', () => {
      component.sidebarHidden.set(true);
      fixture.detectChanges();

      const showBtn = fixture.nativeElement.querySelector(
        'button[app-show-sidebar-button]',
      ) as HTMLElement;
      showBtn.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[app-show-sidebar-button]')).toBeNull();
    });

    it('updates the sidebarHidden signal on the HeaderBar when hidden', () => {
      const headerDE = fixture.debugElement.query(By.directive(HeaderBar));
      expect(headerDE.componentInstance.sidebarHidden()).toBe(false);

      const hideBtn = fixture.nativeElement.querySelector('.hide-button') as HTMLElement;
      hideBtn.click();
      fixture.detectChanges();

      expect(headerDE.componentInstance.sidebarHidden()).toBe(true);
    });
  });

  describe('isAddTaskDisabled() reflects store state', () => {
    it('returns false when the current board has columns', () => {
      expect(component.isAddTaskDisabled()).toBe(false);
    });

    it('Add New Task button is enabled when current board has columns', () => {
      const btn = fixture.nativeElement.querySelector('.add-task-button') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });
  });

  describe('open:add-board custom event integration', () => {
    it('opens the AddBoard modal in HeaderBar when the custom event is dispatched', () => {
      window.dispatchEvent(new CustomEvent('open:add-board'));
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('app-modal');
      expect(modal).toBeTruthy();
    });

    it('renders the Add New Board modal title when the event fires', () => {
      window.dispatchEvent(new CustomEvent('open:add-board'));
      fixture.detectChanges();

      const header = fixture.nativeElement.querySelector('app-modal h2');
      expect(header?.textContent).toContain('Add New Board');
    });

    it('sets addBoardOpen to true on the HeaderBar when the event fires', () => {
      const headerDE = fixture.debugElement.query(By.directive(HeaderBar));
      expect(headerDE.componentInstance['addBoardOpen']()).toBe(false);

      window.dispatchEvent(new CustomEvent('open:add-board'));

      expect(headerDE.componentInstance['addBoardOpen']()).toBe(true);
    });

    it('closes the AddBoard modal when the close:add-board event is dispatched', () => {
      window.dispatchEvent(new CustomEvent('open:add-board'));
      fixture.detectChanges();

      window.dispatchEvent(new CustomEvent('close:add-board'));
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('app-modal');
      expect(modal).toBeNull();
    });
  });
});
