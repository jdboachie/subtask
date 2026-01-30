import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

export type SidebarButtonVariant = 'default' | 'create';

@Component({
  selector: 'button[app-sidebar-button]',
  hostDirectives: [NgpButton],
  template: `
    <svg class="icon" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z"
        fill="currentColor"
      />
    </svg>
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 276px;
      height: 3rem;
      padding-inline: 1.5rem;
      border: none;
      border-radius: 0 100px 100px 0;
      background-color: transparent;
      color: var(--color-gray);
      font-family: var(--font-family);
      font-size: var(--font-size-m);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-m);
      cursor: pointer;
      transition:
        background-color 150ms ease,
        color 150ms ease;
    }

    :host[data-hover] {
      background-color: var(--sidebar-btn-hover-bg);
      color: var(--color-primary);
    }

    :host[data-active='true'] {
      background-color: var(--color-primary);
      color: var(--color-white);
    }

    :host[data-active='true'][data-hover] {
      background-color: var(--color-primary);
      color: var(--color-white);
    }

    :host[data-variant='create'] {
      color: var(--color-primary);
    }

    :host[data-variant='create'][data-hover] {
      background-color: var(--sidebar-btn-hover-bg);
      color: var(--color-primary);
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--color-primary-light);
      outline-offset: 2px;
    }

    .icon {
      flex-shrink: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-active]': 'active()',
    '[attr.data-variant]': 'variant()',
  },
})
export class SidebarButton {
  readonly active = input(false);
  readonly variant = input<SidebarButtonVariant>('default');
}
