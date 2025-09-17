import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

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
  popperVariation,
  provideTippyConfig,
  provideTippyLoader,
  tooltipVariation,
} from '@ngneat/helipopper/config';
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
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { structureInterceptor } from './core/interceptors/structure.interceptor';
import { AuthService } from './core/services/auth.service';
import { FRENCH_TRANSLATIONS } from './fr.translation';
import { SgdfPresetTheme } from './theme/theme';

registerLocaleData(localeFR);

export const appConfig: ApplicationConfig = {
  providers: [
    DialogService,
    MessageService,
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideQueryClient(new QueryClient()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        structureInterceptor,
        cacheInterceptor,
      ])
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
        appendTo: 'body',
      },
      theme: {
        preset: SgdfPresetTheme,
        options: {
          darkModeSelector: false,
        },
      },
      translation: FRENCH_TRANSLATIONS,
      overlayAppendTo: 'body',
      csp: {
        nonce: 'matos-frontend',
      },
    }),

    provideTippyLoader(() => import('tippy.js')),
    provideTippyConfig({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: {
          ...tooltipVariation,
          arrow: true,
          theme: 'light',
          placement: 'bottom',
          inertia: true,
        },
        popper: { ...popperVariation },
      },
    }),
  ],
};
