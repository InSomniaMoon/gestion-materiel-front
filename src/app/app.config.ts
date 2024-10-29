import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { registerLocaleData } from '@angular/common';
import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import localeFR from '@angular/common/locales/fr';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  CalendarDateFormatter,
  CalendarModule,
  DateAdapter,
} from 'angular-calendar';
import { routes } from './app.routes';
import { CustomDateFormatter } from './core/adapters/custom-date.adapter';
import { init } from './core/init';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
registerLocaleData(localeFR);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    ),
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },

    {
      provide: APP_INITIALIZER,
      useFactory: init,
      deps: [AuthService, HttpClient],
      multi: true,
    },
  ],
};
