import { TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button Component', () => {
  let fixture: any;
  let component: Button;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the button component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default size lg', () => {
      expect(component.size()).toBe('lg');
    });

    it('should have default variant primary', () => {
      expect(component.variant()).toBe('primary');
    });
  });

  describe('Inputs', () => {
    it('should update size input', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(component.size()).toBe('sm');
    });

    it('should update variant input', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();
      expect(component.variant()).toBe('secondary');
    });

    it('should accept destructive variant', () => {
      fixture.componentRef.setInput('variant', 'destructive');
      fixture.detectChanges();
      expect(component.variant()).toBe('destructive');
    });
  });

  describe('Host Bindings', () => {
    it('should bind size to data-size attribute', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-size')).toBe('sm');
    });

    it('should bind variant to data-variant attribute', () => {
      fixture.componentRef.setInput('variant', 'destructive');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-variant')).toBe('destructive');
    });

    it('should update data attributes when inputs change', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();

      expect(fixture.nativeElement.getAttribute('data-size')).toBe('sm');
      expect(fixture.nativeElement.getAttribute('data-variant')).toBe('secondary');
    });
  });

  describe('Template Rendering', () => {
    it('should create component with proper attributes set', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();

      expect(component.size()).toBe('sm');
      expect(component.variant()).toBe('secondary');
    });
  });

  describe('Size and Variant Combinations', () => {
    (['sm', 'lg'] as const).forEach((size) => {
      (['primary', 'secondary', 'destructive'] as const).forEach((variant) => {
        it(`should support ${size} size with ${variant} variant`, () => {
          fixture.componentRef.setInput('size', size);
          fixture.componentRef.setInput('variant', variant);
          fixture.detectChanges();

          expect(component.size()).toBe(size);
          expect(component.variant()).toBe(variant);
        });
      });
    });
  });
});
