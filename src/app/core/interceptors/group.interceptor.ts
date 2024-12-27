import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const groupInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.body) {
    req = req.clone({
      body: {
        ...req.body,
        group_id: inject(AuthService).selectedGroup()?.group_id,
      },
    });
  }
  return next(req);
};
