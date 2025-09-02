import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { EventsService } from '@app/core/services/events.service';

export const EVENTS_ROUTES: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./create-edit-event/create-edit-event.component').then(
        m => m.CreateEditEventComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./event-details/event-details.component').then(
        m => m.EventDetailsComponent
      ),
    resolve: {
      event: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(EventsService).getEventById(route.paramMap.get('id')!);
      },
    },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./create-edit-event/create-edit-event.component').then(
        m => m.CreateEditEventComponent
      ),
    resolve: {
      event: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(EventsService).getEventById(route.paramMap.get('id')!);
      },
    },
  },
];
