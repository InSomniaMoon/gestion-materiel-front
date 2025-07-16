import { Routes } from '@angular/router';
import { AuthenticatedShellComponent } from './authenticated-shell/authenticated-shell.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
    title: 'Connexion',
  },
  {
    path: '',
    canMatch: [authGuard],
    component: AuthenticatedShellComponent,
    children: [
      {
        path: 'items',
        loadChildren: () =>
          import('./pages/items/items.routes').then(m => m.ITEMS_ROUTES),
      },
      {
        path: 'backoffice',
        loadChildren: () =>
          import('./pages/backoffice/backoffice.routes').then(
            m => m.APP_ADMIN_ROUTES
          ),
      },
      {
        path: 'admin',
        canMatch: [adminGuard],
        loadChildren: () =>
          import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
      },
      { path: '**', redirectTo: 'items' },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
