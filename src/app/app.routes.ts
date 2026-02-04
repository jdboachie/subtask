import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth';
import { guestGuard } from './auth/guards/guest';
import { unsavedChangesGuard } from './auth/guards/unsaved-changes';
import { AppLayout } from './layout/app-layout';
import { BoardDetailsPage } from './pages/board-details/board-details';
import { BoardsPage } from './pages/boards/boards';
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
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: BoardsPage,
      },
      {
        path: ':id',
        component: BoardDetailsPage,
        canDeactivate: [unsavedChangesGuard],
      },
    ],
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
