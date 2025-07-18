export const EVENTS_ROUTES = [
  {
    path: 'create',
    loadComponent: () =>
      import('./create-event/create-event.component').then(
        m => m.CreateEventComponent
      ),
  },
];
