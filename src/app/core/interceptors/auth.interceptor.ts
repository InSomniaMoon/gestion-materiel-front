import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platform = inject(PLATFORM_ID);
  if (isPlatformBrowser(platform)) {
    const token = localStorage.getItem('auth_token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(req).pipe(
    tap({
      error: (error) => {
        console.error('Error', error.error);
        if (error.error.error === 'Token not valid') {
          inject(AuthService).logout();
          console.warn('Token expired');
        }
      },
    }),
  );
};
