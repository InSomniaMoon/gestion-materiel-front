import { Routes } from '@angular/router';
import { CreateItemComponent } from './create-item/create-item.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/admin/items/create',
    pathMatch: 'full',
  },
  {
    path: 'items',
    children: [
      {
        path: 'create',
        component: CreateItemComponent,
      },
    ],
  },
];
