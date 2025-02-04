import { Routes } from '@angular/router';
import { AppAdminDashboardComponent } from './app-admin-dashboard/app-admin-dashboard.component';
import { AppAdminGroupsListComponent } from './app-admin-groups-list/app-admin-groups-list.component';
import { AppAdminUsersListComponent } from './app-admin-users-list/app-admin-users-list.component';
import { AppAdminShellComponent } from './app-admin.shell';

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
