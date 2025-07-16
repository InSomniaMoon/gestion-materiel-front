import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { Password } from 'primeng/password';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, FloatLabel, ButtonDirective, Password],
  template: `
    <form [formGroup]="form" (ngSubmit)="form.valid && resetPassword()">
      <h1>Réinitialisation du mot de passe</h1>
      <p-float-label>
        <input
          pInputText
          id="email"
          formControlName="email"
          autocomplete="email" />
        <label for="email">Email</label>
      </p-float-label>
      <p-float-label>
        <p-password
          [toggleMask]="true"
          id="password"
          formControlName="password"
          type="password"
          autocomplete="new-password" />
        <label for="password">Mot de passe (min. 8 caractères)</label>
      </p-float-label>
      <p-float-label>
        <p-password
          id="password_confirmation"
          formControlName="password_confirmation"
          [toggleMask]="true"
          [feedback]="false"
          autocomplete="confirm-password" />
        <label for="password_confirmation">Confirm Password</label>
      </p-float-label>
      <button pButton [disabled]="!form.valid" type="submit">
        Reset Password
      </button>
    </form>
  `,
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  constructor() {}

  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  passwordMatchValidator: ValidatorFn = (form: AbstractControl) =>
    form.get('password')?.value === form.get('password_confirmation')?.value
      ? null
      : { passwordMismatch: true };

  form = this.fb.nonNullable.group(
    {
      email: ['', { validators: [Validators.required, Validators.email] }],
      password: [
        '',
        { validators: [Validators.required, Validators.minLength(8)] },
      ],
      password_confirmation: [
        '',
        { validators: [Validators.required, this.passwordMatchValidator] },
      ],
      token: [
        this.activatedRoute.snapshot.queryParams['token'],
        { validators: [Validators.required] },
      ],
    },
    { validators: [this.passwordMatchValidator] }
  );

  ngOnInit(): void {
    // get the token from the url
    const token = this.activatedRoute.snapshot.queryParams['token'];
  }
  private readonly authService = inject(AuthService);
  private readonly toast = inject(MessageService);
  private readonly router = inject(Router);
  resetPassword() {
    this.authService
      .resetPassword(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Password reset');
          this.toast.add({
            severity: 'success',
            summary: 'Succès',
            detail:
              'Votre mot de passe a été réinitialisé avec succès. vous pouvez maintenant vous connecter.',
          });
          this.router.navigate(['auth', 'login']);
        },
        error: err => {
          console.error(err);
          this.toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail:
              'Erreur lors de la réinitialisation du mot de passe.\n' +
              err.error.message,
          });
        },
      });
  }
}
