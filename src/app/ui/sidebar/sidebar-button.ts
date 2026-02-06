import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

export type SidebarButtonVariant = 'default' | 'create';

@Component({
  selector: 'button[app-sidebar-button], a[app-sidebar-button]',
  hostDirectives: [NgpButton],
  templateUrl: './sidebar-button.html',
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
      text-decoration: none;
      cursor: pointer;
      transition:
        background-color 150ms ease,
        color 150ms ease;
    }

    :host[data-hover] {
      background-color: var(--sidebar-btn-hover-bg);
      color: var(--color-primary);
    }

    :host.active,
    :host[data-active='true'] {
      background-color: var(--color-primary);
      color: var(--color-white);
    }

    :host.active[data-hover],
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
