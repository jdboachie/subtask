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
        children: [
          {
            path: 'new-task',
            loadComponent: () => import('./pages/new-task/new-task').then((m) => m.NewTaskPage),
          },
          {
            path: 'new-column',
            loadComponent: () =>
              import('./pages/add-column/add-column').then((m) => m.AddColumnPage),
          },
        ],
      },
    ],
  },
];
