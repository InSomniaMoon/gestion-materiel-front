import { Routes } from '@angular/router';
import { AuthenticatedShellComponent } from './authenticated-shell/authenticated-shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    title: 'Connexion',
  },
  {path: '',
    component: AuthenticatedShellComponent,
    children: [
      {
        path: 'items',
        canMatch: [authGuard],
        loadChildren: () =>
          import('./pages/items/items.routes').then((m) => m.ITEMS_ROUTES),
      },
    ]
  },
  { path: '**', redirectTo: 'items' },
];
