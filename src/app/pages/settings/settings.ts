import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth';
import { Button } from '../../ui/button/button';

@Component({
  selector: 'app-settings-page',
  imports: [RouterLink, Button],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
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
