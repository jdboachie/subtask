import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardView } from './board';
import { ColumnView } from './column/column';
import { BoardSelectors, BoardActions } from '../../store';
import { Board } from './board.model';

const boardWithTasks: Board = {
  id: 'board-1',
  name: 'Platform Launch',
  columns: [
    {
      name: 'Todo',
      tasks: [
        {
          id: 't1',
          title: 'Design UI',
          description: '',
          status: 'Todo',
          subtasks: [
            { title: 'Create mockups', isCompleted: true },
            { title: 'Review designs', isCompleted: false },
          ],
        },
        {
          id: 't2',
          title: 'Write tests',
          description: '',
          status: 'Todo',
          subtasks: [],
        },
      ],
    },
    {
      name: 'In Progress',
      tasks: [],
    },
  ],
};

const boardNoColumns: Board = { id: 'board-2', name: 'Empty Board', columns: [] };

describe('BoardView Integration (BoardView + ColumnView + TaskCard)', () => {
  let fixture: any;
  let store: { dispatch: jest.Mock; selectSignal: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    store = {
      dispatch: jest.fn(),
      selectSignal: jest.fn().mockReturnValue(() => boardWithTasks),
    };
    router = { navigate: jest.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [BoardView],
      providers: [
        { provide: Store, useValue: store },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardView);
    fixture.componentRef.setInput('currentBoard', boardWithTasks);
    fixture.detectChanges();
  });

  describe('Column rendering', () => {
    it('renders one ColumnView child per column', () => {
      const columns = fixture.debugElement.queryAll(By.directive(ColumnView));
      expect(columns).toHaveLength(2);
    });

    it('passes the correct column data to each ColumnView', () => {
      const columns = fixture.debugElement.queryAll(By.directive(ColumnView));
      expect(columns[0].componentInstance.column()).toEqual(boardWithTasks.columns[0]);
      expect(columns[1].componentInstance.column()).toEqual(boardWithTasks.columns[1]);
    });

    it('passes the correct columnIndex to each ColumnView', () => {
      const columns = fixture.debugElement.queryAll(By.directive(ColumnView));
      expect(columns[0].componentInstance.columnIndex()).toBe(0);
      expect(columns[1].componentInstance.columnIndex()).toBe(1);
    });

    it('renders the column name in each column header', () => {
      const headers = fixture.nativeElement.querySelectorAll('.column-name');
      expect(headers[0].textContent).toContain('Todo');
      expect(headers[1].textContent).toContain('In Progress');
    });

    it('renders the task count in each column header', () => {
      const headers = fixture.nativeElement.querySelectorAll('.column-name');
      expect(headers[0].textContent).toContain('2');
      expect(headers[1].textContent).toContain('0');
    });

    it('shows the "+ New Column" button when board has columns', () => {
      const newColumnDiv = fixture.nativeElement.querySelector('.new-column');
      expect(newColumnDiv).toBeTruthy();
      expect(newColumnDiv.textContent).toContain('+ New Column');
    });
  });

  describe('Task card rendering', () => {
    it('renders a task card for each task', () => {
      const taskTitles = fixture.nativeElement.querySelectorAll('.task-title');
      expect(taskTitles).toHaveLength(2);
    });

    it('renders the correct task title in each task card', () => {
      const taskTitles = fixture.nativeElement.querySelectorAll('.task-title');
      expect(taskTitles[0].textContent).toContain('Design UI');
      expect(taskTitles[1].textContent).toContain('Write tests');
    });

    it('renders subtask progress on task cards that have subtasks', () => {
      const subtaskCounts = fixture.nativeElement.querySelectorAll('.subtask-count');
      expect(subtaskCounts).toHaveLength(1);
      expect(subtaskCounts[0].textContent).toContain('1 of 2');
    });

    it('does not render subtask count when task has no subtasks', () => {
      const taskCards = fixture.nativeElement.querySelectorAll('.task-title');
      const writeTestsCard = taskCards[1].closest('app-task') as HTMLElement | null;
      const subtaskEl = writeTestsCard?.querySelector('.subtask-count');
      expect(subtaskEl).toBeNull();
    });
  });

  describe('taskDrop event propagation (ColumnView → BoardView)', () => {
    it('dispatches moveTask when ColumnView emits a taskDrop event', () => {
      const columnDE = fixture.debugElement.queryAll(By.directive(ColumnView))[0];
      const dropEvent = {
        sourceColumnIndex: 0,
        targetColumnIndex: 1,
        sourceTaskIndex: 0,
        targetTaskIndex: 0,
      };

      columnDE.componentInstance.taskDrop.emit(dropEvent);
      fixture.detectChanges();

      expect(store.dispatch).toHaveBeenCalledWith(BoardActions.moveTask(dropEvent));
    });

    it('dispatches moveTask with source and target indices from the drop event', () => {
      const columnDE = fixture.debugElement.queryAll(By.directive(ColumnView))[1];
      const dropEvent = {
        sourceColumnIndex: 1,
        targetColumnIndex: 0,
        sourceTaskIndex: 0,
        targetTaskIndex: 1,
      };

      columnDE.componentInstance.taskDrop.emit(dropEvent);

      expect(store.dispatch).toHaveBeenCalledWith(BoardActions.moveTask(dropEvent));
    });

    it('emits taskMoved output after a drop', () => {
      const taskMovedSpy = jest.fn();
      fixture.componentInstance.taskMoved.subscribe(taskMovedSpy);

      const columnDE = fixture.debugElement.queryAll(By.directive(ColumnView))[0];
      columnDE.componentInstance.taskDrop.emit({
        sourceColumnIndex: 0,
        targetColumnIndex: 1,
        sourceTaskIndex: 0,
        targetTaskIndex: 0,
      });

      expect(taskMovedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty board state', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('currentBoard', boardNoColumns);
      fixture.detectChanges();
    });

    it('shows the empty state message when board has no columns', () => {
      const msg = fixture.nativeElement.querySelector('.empty-message');
      expect(msg).toBeTruthy();
      expect(msg.textContent).toContain('This board is empty');
    });

    it('renders no ColumnView instances when board has no columns', () => {
      const columns = fixture.debugElement.queryAll(By.directive(ColumnView));
      expect(columns).toHaveLength(0);
    });

    it('shows the "+ Add New Column" button in the empty state', () => {
      const btn = fixture.nativeElement.querySelector('button[app-button]') as HTMLElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('+ Add New Column');
    });

    it('navigates to new-column route when "+ Add New Column" is clicked', () => {
      store.selectSignal.mockReturnValue(() => boardNoColumns);
      const btn = fixture.nativeElement.querySelector('button[app-button]') as HTMLElement;
      btn.click();
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/boards/', 'board-2', 'new-column']);
    });

    it('does not show "+ New Column" in the empty state', () => {
      const newCol = fixture.nativeElement.querySelector('.new-column');
      expect(newCol).toBeNull();
    });
  });

  describe('Null board state', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('currentBoard', null);
      fixture.detectChanges();
    });

    it('shows "No board selected" when currentBoard is null', () => {
      const msg = fixture.nativeElement.querySelector('.no-board');
      expect(msg).toBeTruthy();
      expect(msg.textContent).toContain('No board selected');
    });

    it('renders no ColumnView instances when currentBoard is null', () => {
      const columns = fixture.debugElement.queryAll(By.directive(ColumnView));
      expect(columns).toHaveLength(0);
    });

    it('does not show the empty state message when currentBoard is null', () => {
      const msg = fixture.nativeElement.querySelector('.empty-message');
      expect(msg).toBeNull();
    });
  });
});
