import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="container">
      <h1 class="title">404</h1>
      <p class="message">Page not found</p>
      <p class="description">The page you're looking for doesn't exist or has been moved.</p>
      <a routerLink="/boards">Go to Boards</a>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 100vh;
      min-height: 100dvh;
      background-color: var(--bg-primary);
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem;
    }

    .title {
      font-size: 6rem;
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
      line-height: 1;
      margin-block-end: 1rem;
    }

    .message {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-heading);
      margin-block-end: 0.5rem;
    }

    .description {
      font-size: var(--font-size-body-l);
      color: var(--text-secondary);
      margin-block-end: 2rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
