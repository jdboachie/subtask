import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.open]': 'open()',
  },
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  readonly close = output<void>();
  readonly confirm = output<void>();

  protected readonly titleId = computed(() => `modal-title-${Math.random().toString(36).slice(2, 9)}`);

  protected onBackdropKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    this.onClose();
  }

  protected onClose(): void {
    this.close.emit();
  }
}
