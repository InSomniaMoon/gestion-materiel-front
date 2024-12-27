import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
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
import { groupInterceptor } from './core/interceptors/group.interceptor';
import { AuthService } from './core/services/auth.service';
import { SgdfPresetTheme } from './theme/theme';

registerLocaleData(localeFR);

export const appConfig: ApplicationConfig = {
  providers: [
    DialogService,
    MessageService,
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
    provideQueryClient(new QueryClient()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, groupInterceptor]),
    ),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideAppInitializer(() => init(inject(AuthService), inject(HttpClient))),
    providePrimeNG({
      ripple: true,
      inputStyle: 'outlined',
      overlayOptions: {
        hideOnEscape: true,
        responsive: {
          breakpoint: '768px',
          direction: 'bottom',
        },
      },
      theme: {
        preset: SgdfPresetTheme,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
