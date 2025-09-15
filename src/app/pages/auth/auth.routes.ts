import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RequestResetPasswordComponent } from './request-reset-password/request-reset-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'request-reset-password', component: RequestResetPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];
