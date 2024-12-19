import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

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
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from './app.routes';
import { init } from './core/init';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { SgdfPresetTheme } from './theme/theme';

registerLocaleData(localeFR);

export const appConfig: ApplicationConfig = {
  providers: [
    DialogService,
    MessageService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(),
    provideQueryClient(new QueryClient()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideAppInitializer(() => {
      const initializerFn = init(inject(AuthService), inject(HttpClient));
      return initializerFn();
    }),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: SgdfPresetTheme,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
  ],
};
