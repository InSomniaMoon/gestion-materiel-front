import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { navigateAuth } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platform = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService);
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
        console.warn(error.error.error);

        if (error.error.error == 'Token not valid') {
          authService.logout();
          navigateAuth();
          router.navigate(['/auth/login']);
          console.warn('Token expired');
        }
      },
    }),
  );
};
