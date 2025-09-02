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
      import('./create-event/create-event.component').then(
        m => m.CreateEventComponent
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
];
