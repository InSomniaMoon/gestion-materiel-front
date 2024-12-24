import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const adminGuard: CanMatchFn = (route, segments) =>
  inject(AuthService).isAdmin();
