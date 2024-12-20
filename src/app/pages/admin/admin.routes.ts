import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CreateItemComponent } from './items/create-item/create-item.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
  },
  {
    path: 'items',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./items/items-list/items-list.component').then(
            (m) => m.ItemsListComponent,
          ),
      },
      {
        path: 'create',
        component: CreateItemComponent,
      },
    ],
  },
];
