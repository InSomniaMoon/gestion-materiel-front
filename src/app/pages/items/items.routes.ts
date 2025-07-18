import { Routes } from '@angular/router';
import { ItemDetailsComponent } from './item-details/item-details.component';

export const ITEMS_ROUTES: Routes = [
  {
    path: ':itemId',
    component: ItemDetailsComponent,
  },
];
