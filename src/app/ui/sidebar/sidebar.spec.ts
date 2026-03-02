import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';
import { Board } from '../board/board.model';

describe('Sidebar Component', () => {
  let fixture: any;
  let component: Sidebar;

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
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the sidebar component', () => {
      expect(component).toBeTruthy();
    });

    it('should have empty boards array by default', () => {
      expect(component.boards()).toEqual([]);
    });

    it('should have hidden false by default', () => {
      expect(component.hidden()).toBe(false);
    });
  });

  describe('Boards Input', () => {
    it('should accept boards input', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();
      expect(component.boards()).toEqual(mockBoards);
    });

    it('should update when boards input changes', () => {
      fixture.componentRef.setInput('boards', [mockBoards[0]]);
      fixture.detectChanges();
      expect(component.boards().length).toBe(1);

      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();
      expect(component.boards().length).toBe(3);
    });

    it('should handle empty boards array', () => {
      fixture.componentRef.setInput('boards', []);
      fixture.detectChanges();
      expect(component.boards().length).toBe(0);
    });

    it('should maintain board order', () => {
      const reorderedBoards = [mockBoards[2], mockBoards[0], mockBoards[1]];
      fixture.componentRef.setInput('boards', reorderedBoards);
      fixture.detectChanges();
      expect(component.boards()[0].id).toBe('board-3');
      expect(component.boards()[1].id).toBe('board-1');
      expect(component.boards()[2].id).toBe('board-2');
    });
  });

  describe('Hidden Input', () => {
    it('should accept hidden input', () => {
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();
      expect(component.hidden()).toBe(true);
    });

    it('should toggle hidden state', () => {
      fixture.componentRef.setInput('hidden', false);
      fixture.detectChanges();
      expect(component.hidden()).toBe(false);

      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();
      expect(component.hidden()).toBe(true);
    });
  });

  describe('Outputs', () => {
    it('should have createBoard output event', () => {
      expect(component.createBoard).toBeTruthy();
    });

    it('should have hide output event', () => {
      expect(component.hide).toBeTruthy();
    });
  });

  describe('Computed Properties', () => {
    it('should compute board count correctly', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();
      expect(component['boardCount']()).toBe(3);
    });

    it('should update board count when boards change', () => {
      fixture.componentRef.setInput('boards', [mockBoards[0]]);
      fixture.detectChanges();
      expect(component['boardCount']()).toBe(1);

      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();
      expect(component['boardCount']()).toBe(3);
    });

    it('should handle zero boards', () => {
      fixture.componentRef.setInput('boards', []);
      fixture.detectChanges();
      expect(component['boardCount']()).toBe(0);
    });

    it('should compute correct count for large board list', () => {
      const manyBoards = Array.from({ length: 100 }, (_, i) => ({
        id: `board-${i}`,
        title: `Board ${i}`,
        columns: [],
      }));
      fixture.componentRef.setInput('boards', manyBoards);
      fixture.detectChanges();
      expect(component['boardCount']()).toBe(100);
    });
  });

  describe('Host Bindings', () => {
    it('should bind hidden attribute when hidden is true', () => {
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-hidden')).toBe('true');
    });

    it('should bind hidden attribute when hidden is false', () => {
      fixture.componentRef.setInput('hidden', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-hidden')).toBe('false');
    });

    it('should update hidden attribute when state changes', () => {
      fixture.componentRef.setInput('hidden', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-hidden')).toBe('false');

      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-hidden')).toBe('true');
    });
  });

  describe('Template Rendering', () => {
    it('should create sidebar component', () => {
      expect(component).toBeTruthy();
    });

    it('should accept boards and hidden inputs for rendering', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.componentRef.setInput('hidden', false);
      fixture.detectChanges();
      expect(component.boards().length).toBe(3);
      expect(component.hidden()).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should maintain board list independence from hidden state', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();

      expect(component.boards().length).toBe(3);
      expect(component.hidden()).toBe(true);
    });

    it('should handle concurrent updates', () => {
      fixture.componentRef.setInput('boards', [mockBoards[0]]);
      fixture.componentRef.setInput('hidden', false);
      fixture.detectChanges();

      fixture.componentRef.setInput('boards', mockBoards);
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();

      expect(component.boards().length).toBe(3);
      expect(component.hidden()).toBe(true);
    });

    it('should update board count after boards change while hidden', () => {
      fixture.componentRef.setInput('boards', [mockBoards[0]]);
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();

      expect(component['boardCount']()).toBe(1);

      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();

      expect(component['boardCount']()).toBe(3);
      expect(component.hidden()).toBe(true);
    });
  });

  describe('Board Updates', () => {
    it('should detect when specific board is added', () => {
      fixture.componentRef.setInput('boards', [mockBoards[0], mockBoards[1]]);
      fixture.detectChanges();

      const updatedBoards = [mockBoards[0], mockBoards[1], mockBoards[2]];
      fixture.componentRef.setInput('boards', updatedBoards);
      fixture.detectChanges();

      expect(component.boards().length).toBe(3);
      expect(component.boards()[2].id).toBe('board-3');
    });

    it('should detect when specific board is removed', () => {
      fixture.componentRef.setInput('boards', mockBoards);
      fixture.detectChanges();

      const updatedBoards = [mockBoards[0], mockBoards[2]];
      fixture.componentRef.setInput('boards', updatedBoards);
      fixture.detectChanges();

      expect(component.boards().length).toBe(2);
      expect(component['boardCount']()).toBe(2);
    });
  });
});
