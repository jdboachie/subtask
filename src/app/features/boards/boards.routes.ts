import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../auth/guards/unsaved-changes';
import { AppLayout } from '../../layout/app-layout';
import { NewTaskPage } from './pages/new-task/new-task';
import { AddColumnPage } from './pages/add-column/add-column';
import { EditBoardPage } from './pages/edit-board/edit-board';
import { DeleteBoardModal } from './pages/delete-board/delete-board';
import { ViewTaskPage } from './pages/view-task/view-task';
import { EditTaskPage } from './pages/edit-task/edit-task';
import { DeleteTaskModal } from './pages/delete-task/delete-task';

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
            path: 'task',
            children: [
              {
                path: 'new',
                component: NewTaskPage,
              },
              {
                path: ':id',
                component: ViewTaskPage,
                children: [
                  {
                    path: 'edit',
                    component: EditTaskPage,
                  },
                  {
                    path: 'delete',
                    component: DeleteTaskModal,
                  },
                ],
              },
            ],
          },
          {
            path: 'new-column',
            component: AddColumnPage,
          },
          {
            path: 'edit',
            component: EditBoardPage,
          },
          {
            path: 'delete',
            component: DeleteBoardModal,
          },
        ],
      },
    ],
  },
];
