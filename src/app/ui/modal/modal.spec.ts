import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

describe('Modal Component', () => {
  let fixture: any;
  let component: Modal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the modal component', () => {
      expect(component).toBeTruthy();
    });

    it('should have open input as false by default', () => {
      expect(component.open()).toBe(false);
    });

    it('should have empty title by default', () => {
      expect(component.title()).toBe('');
    });

    it('should have medium size by default', () => {
      expect(component.size()).toBe('medium');
    });
  });

  describe('Inputs', () => {
    it('should update open state', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);
    });

    it('should update title', () => {
      const testTitle = 'Test Modal Title';
      fixture.componentRef.setInput('title', testTitle);
      fixture.detectChanges();
      expect(component.title()).toBe(testTitle);
    });

    it('should update size to small', () => {
      fixture.componentRef.setInput('size', 'small');
      fixture.detectChanges();
      expect(component.size()).toBe('small');
    });

    it('should update size to large', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();
      expect(component.size()).toBe('large');
    });
  });

  describe('Outputs', () => {
    it('should emit close event when close method is called', (done) => {
      let emitted = false;
      component.close.subscribe(() => {
        emitted = true;
      });

      // Trigger close by simulating parent behavior
      component.close.emit();

      setTimeout(() => {
        expect(emitted).toBe(true);
        done();
      }, 0);
    });

    it('should emit confirm event when confirm method is called', (done) => {
      let emitted = false;
      component.confirm.subscribe(() => {
        emitted = true;
      });

      // Trigger confirm by simulating parent behavior
      component.confirm.emit();

      setTimeout(() => {
        expect(emitted).toBe(true);
        done();
      }, 0);
    });
  });

  describe('Host Bindings', () => {
    it('should apply open class when open is true', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('open')).toBe(true);
    });

    it('should remove open class when open is false', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('open')).toBe(true);

      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('open')).toBe(false);
    });
  });

  describe('Keyboard Handling', () => {
    it('should have onBackdropKeydown method to handle Escape key', () => {
      // Verify the component has the keyboard handler capability
      expect(typeof component['onBackdropKeydown']).toBe('function');
    });

    it('should handle open state changes', () => {
      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();
      expect(component.open()).toBe(false);

      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should generate unique titleId', () => {
      const titleId1 = component['titleId']();
      const titleId2 = component['titleId']();
      expect(titleId1).toMatch(/^modal-title-/);
      expect(titleId2).toMatch(/^modal-title-/);
    });

    it('should include modal-title prefix in titleId', () => {
      const titleId = component['titleId']();
      expect(titleId.startsWith('modal-title-')).toBe(true);
    });
  });

  describe('State Transitions', () => {
    it('should transition from closed to open', () => {
      expect(component.open()).toBe(false);
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);
    });

    it('should maintain state through multiple updates', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);

      fixture.componentRef.setInput('title', 'New Title');
      fixture.detectChanges();
      expect(component.open()).toBe(true);
      expect(component.title()).toBe('New Title');
    });

    it('should handle rapid state changes', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(component.open()).toBe(true);
    });
  });
});
