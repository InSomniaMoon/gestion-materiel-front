import { Routes } from '@angular/router';
import { AppAdminDashboardComponent } from './backoffice-dashboard/backoffice-dashboard.component';
import { AppAdminGroupsListComponent } from './backoffice-groups-list/backoffice-groups-list.component';
import { AppAdminUsersListComponent } from './backoffice-users-list/backoffice-users-list.component';
import { AppAdminShellComponent } from './backoffice.shell';

export const APP_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AppAdminShellComponent,
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
        path: 'groups',
        component: AppAdminGroupsListComponent,
      },
    ],
  },
];
