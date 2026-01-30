import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

export type ButtonSize = 'sm' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

@Component({
  selector: 'button[app-button]',
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: `<ng-content />`,
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
})
export class Button {
  readonly size = input<ButtonSize>('lg');
  readonly variant = input<ButtonVariant>('primary');
}
