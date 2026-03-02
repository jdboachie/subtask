import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { ColumnView, ColumnDropEvent } from './column';
import { Column, Task } from '../board.model';

describe('ColumnView Component', () => {
  let fixture: any;
  let component: ColumnView;

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
    {
      id: 'task-3',
      title: 'Task 3',
      description: 'Description 3',
      status: 'todo',
      subtasks: [],
    },
  ];

  const mockColumn: Column = {
    name: 'Todo',
    tasks: mockTasks,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnView],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnView);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create the column view component', () => {
      expect(component).toBeTruthy();
    });

    it('should require column input', () => {
      expect(() => {
        fixture.detectChanges();
      }).toThrow();
    });

    it('should require columnIndex input', () => {
      fixture.componentRef.setInput('column', mockColumn);
      expect(() => {
        fixture.detectChanges();
      }).toThrow();
    });
  });

  describe('Column and ColumnIndex Inputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('column', mockColumn);
      fixture.componentRef.setInput('columnIndex', 0);
      fixture.detectChanges();
    });

    it('should accept column input', () => {
      expect(component.column()).toEqual(mockColumn);
    });

    it('should accept columnIndex input', () => {
      expect(component.columnIndex()).toBe(0);
    });

    it('should update when column changes', () => {
      const newColumn: Column = {
        name: 'In Progress',
        tasks: [mockTasks[0]],
      };
      fixture.componentRef.setInput('column', newColumn);
      fixture.detectChanges();
      expect(component.column().name).toBe('In Progress');
    });

    it('should update when columnIndex changes', () => {
      fixture.componentRef.setInput('columnIndex', 2);
      fixture.detectChanges();
      expect(component.columnIndex()).toBe(2);
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('column', mockColumn);
      fixture.componentRef.setInput('columnIndex', 0);
      fixture.detectChanges();
    });

    it('should compute task count correctly', () => {
      expect(component['taskCount']()).toBe(3);
    });

    it('should update task count when column tasks change', () => {
      const columnWithOneTask: Column = {
        name: mockColumn.name,
        tasks: [mockTasks[0]],
      };
      fixture.componentRef.setInput('column', columnWithOneTask);
      fixture.detectChanges();
      expect(component['taskCount']()).toBe(1);
    });

    it('should handle empty task list', () => {
      const emptyColumn: Column = {
        name: mockColumn.name,
        tasks: [],
      };
      fixture.componentRef.setInput('column', emptyColumn);
      fixture.detectChanges();
      expect(component['taskCount']()).toBe(0);
    });

    it('should compute correct count for large task list', () => {
      const manyTasks = Array.from({ length: 50 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Description ${i}`,
        status: 'todo',
        subtasks: [],
      }));
      const largeColumn: Column = {
        name: mockColumn.name,
        tasks: manyTasks,
      };
      fixture.componentRef.setInput('column', largeColumn);
      fixture.detectChanges();
      expect(component['taskCount']()).toBe(50);
    });
  });

  describe('Drop Event Handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('column', mockColumn);
      fixture.componentRef.setInput('columnIndex', 0);
      fixture.detectChanges();
    });

    it('should have taskDrop output', () => {
      expect(component.taskDrop).toBeTruthy();
    });

    it('should have onDrop method', () => {
      expect(typeof component['onDrop']).toBe('function');
    });

    it('should emit taskDrop event on drop with correct indices', (done) => {
      const mockDropEvent = {
        previousContainer: {
          data: {
            tasks: mockTasks,
            columnIndex: 0,
          },
        },
        container: {
          data: {
            tasks: mockTasks,
            columnIndex: 1,
          },
        },
        previousIndex: 0,
        currentIndex: 1,
      } as any;

      let emittedEvent: ColumnDropEvent | null = null;
      component.taskDrop.subscribe((event) => {
        emittedEvent = event;
      });

      component['onDrop'](mockDropEvent);

      setTimeout(() => {
        expect(emittedEvent).toBeTruthy();
        if (emittedEvent) {
          expect(emittedEvent.sourceColumnIndex).toBe(0);
          expect(emittedEvent.targetColumnIndex).toBe(1);
          expect(emittedEvent.sourceTaskIndex).toBe(0);
          expect(emittedEvent.targetTaskIndex).toBe(1);
        }
        done();
      }, 0);
    });

    it('should preserve drop event details for same column drag', (done) => {
      const mockDropEvent = {
        previousContainer: {
          data: {
            tasks: mockTasks,
            columnIndex: 0,
          },
        },
        container: {
          data: {
            tasks: mockTasks,
            columnIndex: 0,
          },
        },
        previousIndex: 1,
        currentIndex: 2,
      } as any;

      let emittedEvent: ColumnDropEvent | null = null;
      component.taskDrop.subscribe((event) => {
        emittedEvent = event;
      });

      component['onDrop'](mockDropEvent);

      setTimeout(() => {
        expect(emittedEvent).toBeTruthy();
        if (emittedEvent) {
          expect(emittedEvent.sourceColumnIndex).toBe(0);
          expect(emittedEvent.targetColumnIndex).toBe(0);
          expect(emittedEvent.sourceTaskIndex).toBe(1);
          expect(emittedEvent.targetTaskIndex).toBe(2);
        }
        done();
      }, 0);
    });

    it('should handle drop from column 0 to column 2', (done) => {
      const mockDropEvent = {
        previousContainer: {
          data: {
            tasks: [],
            columnIndex: 0,
          },
        },
        container: {
          data: {
            tasks: [],
            columnIndex: 2,
          },
        },
        previousIndex: 0,
        currentIndex: 0,
      } as any;

      let emittedEvent: ColumnDropEvent | null = null;
      component.taskDrop.subscribe((event) => {
        emittedEvent = event;
      });

      component['onDrop'](mockDropEvent);

      setTimeout(() => {
        expect(emittedEvent?.sourceColumnIndex).toBe(0);
        expect(emittedEvent?.targetColumnIndex).toBe(2);
        done();
      }, 0);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('column', mockColumn);
      fixture.componentRef.setInput('columnIndex', 0);
      fixture.detectChanges();
    });

    it('should create column component', () => {
      expect(component).toBeTruthy();
    });

    it('should have taskCount computed property', () => {
      expect(component['taskCount']()).toBe(3);
    });
  });

  describe('Column and Task Changes', () => {
    it('should handle adding tasks to column', () => {
      fixture.componentRef.setInput('column', mockColumn);
      fixture.componentRef.setInput('columnIndex', 0);
      fixture.detectChanges();

      const newTask: Task = {
        id: 'task-4',
        title: 'Task 4',
        description: 'Description 4',
        status: 'todo',
        subtasks: [],
      };

      const updatedColumn: Column = {
        name: mockColumn.name,
        tasks: [...mockColumn.tasks, newTask],
      };
      fixture.componentRef.setInput('column', updatedColumn);
      fixture.detectChanges();

      expect(component['taskCount']()).toBe(4);
    });

    it('should handle removing tasks from column', () => {
      fixture.componentRef.setInput('column', mockColumn);
      fixture.componentRef.setInput('columnIndex', 0);
      fixture.detectChanges();

      const updatedColumn: Column = {
        name: mockColumn.name,
        tasks: [mockTasks[0]],
      };
      fixture.componentRef.setInput('column', updatedColumn);
      fixture.detectChanges();

      expect(component['taskCount']()).toBe(1);
    });

    it('should handle replacing entire task list', () => {
      fixture.componentRef.setInput('column', mockColumn);
      fixture.componentRef.setInput('columnIndex', 0);
      fixture.detectChanges();

      const newTask: Task = {
        id: 'new-task',
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        subtasks: [],
      };

      const updatedColumn: Column = {
        name: mockColumn.name,
        tasks: [newTask],
      };
      fixture.componentRef.setInput('column', updatedColumn);
      fixture.detectChanges();

      expect(component['taskCount']()).toBe(1);
      expect(component.column().tasks[0].id).toBe('new-task');
    });
  });

  describe('Multiple Column Indices', () => {
    it('should handle different column indices correctly', () => {
      fixture.componentRef.setInput('column', mockColumn);

      for (let i = 0; i < 5; i++) {
        fixture.componentRef.setInput('columnIndex', i);
        fixture.detectChanges();
        expect(component.columnIndex()).toBe(i);
      }
    });
  });
});
