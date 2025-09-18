import { Routes } from '@angular/router';
import { ItemDetailsComponent } from './item-details/item-details.component';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../admin/items/items-list/items-list.component').then(
        m => m.ItemsListComponent
      ),
    title: 'Matériel',
  },
  {
    path: ':itemId',
    component: ItemDetailsComponent,
  },
];
