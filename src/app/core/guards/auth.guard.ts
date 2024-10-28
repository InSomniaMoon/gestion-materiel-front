import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const isAuth = inject(AuthService).isAuth;
  const router = inject(Router);

  if (!isAuth()) {
    router.navigate(['/auth', 'login'], {
      queryParams: { redirect: segments.join('/') },
    });
  }
  return isAuth();
};
