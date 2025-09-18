import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const structureInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isAuth() && authService.selectedStructure()) {
    req = req.clone({
      params: req.params.append(
        'code_structure',
        authService.selectedStructure()!.code_structure
      ),
    });
  }

  return next(req);
};
