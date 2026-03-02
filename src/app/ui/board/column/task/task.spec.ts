import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskCard } from './task';
import { Task } from '../../board.model';

describe('TaskCard Component', () => {
  let fixture: any;
  let component: TaskCard;
  let router: Router;
  let route: ActivatedRoute;

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    subtasks: [
      { title: 'Subtask 1', isCompleted: true },
      { title: 'Subtask 2', isCompleted: false },
      { title: 'Subtask 3', isCompleted: true },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard],
      providers: [
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

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
  });

  describe('Initialization', () => {
    it('should create the task card component', () => {
      expect(component).toBeTruthy();
    });

    it('should require task input', () => {
      expect(() => {
        fixture.detectChanges();
      }).toThrow();
    });
  });

  describe('Task Input', () => {
    it('should accept task input and render', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();
      expect(component.task()).toEqual(mockTask);
    });

    it('should update when task input changes', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();

      const updatedTask = { ...mockTask, title: 'Updated Task' };
      fixture.componentRef.setInput('task', updatedTask);
      fixture.detectChanges();

      expect(component.task().title).toBe('Updated Task');
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();
    });

    it('should compute completed subtask count correctly', () => {
      expect(component['completedCount']()).toBe(2);
    });

    it('should compute total subtask count correctly', () => {
      expect(component['totalCount']()).toBe(3);
    });

    it('should handle zero completed subtasks', () => {
      const taskWithNoCompleted: Task = {
        ...mockTask,
        subtasks: mockTask.subtasks.map((s) => ({ title: s.title, isCompleted: false })),
      };
      fixture.componentRef.setInput('task', taskWithNoCompleted);
      fixture.detectChanges();
      expect(component['completedCount']()).toBe(0);
    });

    it('should handle all completed subtasks', () => {
      const taskWithAllCompleted: Task = {
        ...mockTask,
        subtasks: mockTask.subtasks.map((s) => ({ title: s.title, isCompleted: true })),
      };
      fixture.componentRef.setInput('task', taskWithAllCompleted);
      fixture.detectChanges();
      expect(component['completedCount']()).toBe(3);
    });

    it('should handle empty subtask list', () => {
      const taskWithNoSubtasks: Task = {
        ...mockTask,
        subtasks: [],
      };
      fixture.componentRef.setInput('task', taskWithNoSubtasks);
      fixture.detectChanges();
      expect(component['completedCount']()).toBe(0);
      expect(component['totalCount']()).toBe(0);
    });

    it('should update computed properties when task changes', () => {
      expect(component['completedCount']()).toBe(2);
      expect(component['totalCount']()).toBe(3);

      const newTask: Task = {
        ...mockTask,
        subtasks: [
          { title: 'Subtask 1', isCompleted: true },
          { title: 'Subtask 2', isCompleted: true },
        ],
      };
      fixture.componentRef.setInput('task', newTask);
      fixture.detectChanges();

      expect(component['completedCount']()).toBe(2);
      expect(component['totalCount']()).toBe(2);
    });
  });

  describe('Task Click Handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();
    });

    it('should navigate to task details on task click', () => {
      component['onTaskClick']();
      expect(router.navigate).toHaveBeenCalledWith(['task', 'task-1'], {
        relativeTo: route,
      });
    });

    it('should navigate with correct task ID', () => {
      const task2 = { ...mockTask, id: 'task-2' };
      fixture.componentRef.setInput('task', task2);
      fixture.detectChanges();

      component['onTaskClick']();
      expect(router.navigate).toHaveBeenCalledWith(['task', 'task-2'], {
        relativeTo: route,
      });
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();
    });

    it('should have task component created', () => {
      expect(component).toBeTruthy();
    });

    it('should have onTaskClick method', () => {
      expect(typeof component['onTaskClick']).toBe('function');
    });
  });

  describe('Task State Changes', () => {
    it('should handle task with no description', () => {
      const taskNoDesc = { ...mockTask, description: '' };
      fixture.componentRef.setInput('task', taskNoDesc);
      fixture.detectChanges();
      expect(component.task().description).toBe('');
    });

    it('should handle task title changes', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();

      const newTask = { ...mockTask, title: 'New Title' };
      fixture.componentRef.setInput('task', newTask);
      fixture.detectChanges();

      expect(component.task().title).toBe('New Title');
    });

    it('should handle subtask completion changes', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();
      const initialCompleted = component['completedCount']();

      const updatedTask: Task = {
        ...mockTask,
        subtasks: [
          { title: mockTask.subtasks[0].title, isCompleted: true },
          { title: mockTask.subtasks[1].title, isCompleted: true },
          { title: mockTask.subtasks[2].title, isCompleted: true },
        ],
      };
      fixture.componentRef.setInput('task', updatedTask);
      fixture.detectChanges();

      expect(component['completedCount']()).not.toBe(initialCompleted);
    });
  });
});
