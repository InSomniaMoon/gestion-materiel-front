import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const groupInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isAuth() && authService.selectedGroup()) {
    req = req.clone({
      params: req.params.append(
        'group_id',
        authService.selectedGroup()!.group_id,
      ),
    });
  }

  return next(req);
};
