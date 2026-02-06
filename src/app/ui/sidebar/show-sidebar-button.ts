import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'button[app-show-sidebar-button]',
  hostDirectives: [NgpButton],
  templateUrl: './show-sidebar-button.html',
  styles: `
    :host {
      position: fixed;
      bottom: 2rem;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3.5rem;
      height: 3rem;
      border: none;
      border-radius: 0 100px 100px 0;
      background-color: var(--color-primary);
      color: var(--color-white);
      cursor: pointer;
      transition: background-color 150ms ease;
    }

    :host[data-hover] {
      background-color: var(--color-primary-light);
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--color-primary-light);
      outline-offset: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowSidebarButton {}
