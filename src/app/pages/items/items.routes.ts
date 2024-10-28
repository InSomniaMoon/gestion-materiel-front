import { Routes } from '@angular/router';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { ItemsListComponent } from './items-list/items-list.component';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    component: ItemsListComponent,
    title: 'Eléments',
  },
  {
    path: ':id',
    component: ItemDetailsComponent,
    
  },
];
