import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth';
import { Button } from '../../ui/button/button';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, Button],
  templateUrl: './login.html',
  styles: `
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 1rem;
      background-color: var(--bg-primary);
    }

    .login-card {
      width: 100%;
      max-width: 480px;
      padding: 2rem;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 2.5rem;
    }

    .logo {
      display: flex;
      justify-content: center;
      margin-block-end: 2rem;
    }

    .title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-xl);
      color: var(--text-heading);
      text-align: center;
      margin-block-end: 2rem;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label {
      font-size: var(--font-size-s);
      font-weight: var(--font-weight-bold);
      color: var(--text-secondary);
    }

    .input {
      height: 3rem;
      padding-inline: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 9999px;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-family: var(--font-family);
      font-size: var(--font-size-body-l);
      line-height: var(--line-height-body-l);
      transition: border-color 150ms ease;
    }

    .input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .input::placeholder {
      color: var(--text-secondary);
      opacity: 0.5;
    }

    .error {
      color: var(--color-destructive);
      font-size: var(--font-size-body-l);
      text-align: center;
    }

    .submit-btn {
      width: 100%;
      margin-block-start: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected username = '';
  protected password = '';
  protected readonly error = signal('');

  protected onSubmit(): void {
    this.error.set('');

    if (!this.username.trim()) {
      this.error.set('Username is required');
      return;
    }

    if (this.password.length < 4) {
      this.error.set('Password must be at least 4 characters');
      return;
    }

    const success = this.authService.login(this.username, this.password);

    if (success) {
      this.router.navigate(['/boards']);
    } else {
      this.error.set('Invalid credentials');
    }
  }
}
