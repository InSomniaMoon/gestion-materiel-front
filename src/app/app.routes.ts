import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    title: 'Connexion',
  },
  {
    path: 'items',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./pages/items/items.routes').then((m) => m.ITEMS_ROUTES),
  },
  { path: '**', redirectTo: 'auth/login' },
];
