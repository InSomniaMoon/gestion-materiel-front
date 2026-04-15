import { Routes } from '@angular/router';
import { AppAdminDashboardComponent } from './backoffice-dashboard/backoffice-dashboard.component';

import { AppAdminStructuresListComponent } from './backoffice-structures-list/backoffice-structures-list.component';
import { AppAdminUsersListComponent } from './backoffice-users-list/backoffice-users-list.component';
import { ShellComponent } from './shell/shell.component';

export const APP_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: AppAdminDashboardComponent,
      },
      {
        path: 'users',
        component: AppAdminUsersListComponent,
      },
      {
        path: 'structures',
        component: AppAdminStructuresListComponent,
      },
    ],
  },
];
