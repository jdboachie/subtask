import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../auth/guards/unsaved-changes';
import { AppLayout } from '../../layout/app-layout';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/boards/boards').then((m) => m.BoardsPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/board-details/board-details').then((m) => m.BoardDetailsPage),
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },
];
