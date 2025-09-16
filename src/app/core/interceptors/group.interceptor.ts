import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const groupInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isAuth() && authService.selectedStructure()) {
    req = req.clone({
      params: req.params.append(
        'structure_id',
        authService.selectedStructure()!.id
      ),
    });
  }

  return next(req);
};
