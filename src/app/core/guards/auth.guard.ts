import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const isAuth = inject(AuthService).isAuth;

  if (!isAuth()) {
    navigateAuth();
  }
  return isAuth();
};

export const navigateAuth = () => {
  const router = inject(Router);

  router.navigate(['/auth', 'login'], {
    queryParams: { redirect: router.url },
  });
};
