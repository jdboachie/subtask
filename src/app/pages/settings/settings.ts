import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth';
import { Button } from '../../ui/button/button';

@Component({
  selector: 'app-settings-page',
  imports: [RouterLink, Button],
  template: `
    <div class="container">
      <a routerLink="/boards" class="back-link">
        <svg width="6" height="10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M5.293.293 1.586 4l3.707 3.707a1 1 0 0 1-1.414 1.414l-4.414-4.414a1 1 0 0 1 0-1.414L3.879-.121a1 1 0 0 1 1.414 1.414Z"
            fill="currentColor"
          />
        </svg>
        Back to Boards
      </a>

      <div class="content">
        <h1 class="title">Settings</h1>

        <div class="section">
          <h2 class="section-title">Account</h2>
          <button app-button variant="destructive" (click)="onLogout()">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      min-height: 100dvh;
      background-color: var(--bg-primary);
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: var(--font-size-body-l);
      font-weight: var(--font-weight-bold);
      text-decoration: none;
      transition: color 150ms ease;
    }

    .back-link:hover {
      color: var(--color-primary);
    }

    .content {
      margin-block-start: 2rem;
    }

    .title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-xl);
      color: var(--text-heading);
      margin-block-end: 2rem;
    }

    .section {
      background-color: var(--bg-secondary);
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .section-title {
      font-size: var(--font-size-m);
      font-weight: var(--font-weight-bold);
      color: var(--text-secondary);
      margin-block-end: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
