import { Routes } from '@angular/router';
import { CreateItemComponent } from './create-item/create-item.component';

export const ADMIN_ROUTES: Routes = [
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
