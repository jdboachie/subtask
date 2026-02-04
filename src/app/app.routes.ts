import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth';
import { guestGuard } from './auth/guards/guest';
import { LoginPage } from './pages/login/login';
import { NotFoundPage } from './pages/not-found/not-found';
import { SettingsPage } from './pages/settings/settings';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'boards',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPage,
    canActivate: [guestGuard],
  },
  {
    path: 'boards',
    canActivate: [authGuard],
    loadChildren: () => import('./features/boards/boards.routes').then((m) => m.BOARDS_ROUTES),
  },
  {
    path: 'settings',
    component: SettingsPage,
    canActivate: [authGuard],
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
