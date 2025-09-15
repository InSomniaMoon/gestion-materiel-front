import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
  },
  {
    path: 'items',
    children: [
      {
        title: 'Objets',
        path: '',
        loadComponent: () =>
          import('./items/items-list/items-list.component').then(
            m => m.ItemsListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './items/items-list/create-update-item/create-update-item.component'
          ).then(m => m.CreateUpdateItemComponent),
      },
    ],
  },
  {
    path: 'categories',
    children: [
      {
        path: '',
        title: 'Catégories',
        loadComponent: () =>
          import('./categories/categories-list/categories-list.component').then(
            m => m.CategoriesListComponent
          ),
      },
    ],
  },
  {
    path: 'units',
    children: [
      {
        title: 'Unités',
        path: '',
        loadComponent: () =>
          import('./units/units-list/units-list.component').then(
            m => m.UnitsListComponent
          ),
      },
    ],
  },
  {
    path: 'users',
    children: [
      {
        path: '',
        title: 'Utilisateurs',
        loadComponent: () =>
          import('./users/users-list/users-list.component').then(
            m => m.UsersListComponent
          ),
      },
    ],
  },
];
