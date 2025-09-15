import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '@app/core/services/users.service';
import { MessageService } from 'primeng/api';

import { ButtonDirective } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-request-reset-password',
  imports: [FloatLabel, FormsModule, ButtonDirective, InputText],
  templateUrl: './request-reset-password.component.html',
  styleUrl: './request-reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestResetPasswordComponent {
  // get query params
  private readonly messageService = inject(MessageService);
  private readonly userService = inject(UsersService);
  private readonly router = inject(Router);
  error = signal('');

  destroy = new Subject<void>();
  loading = signal(false);

  submitForm(form: NgForm) {
    this.loading.set(true);
    this.userService.sendPasswordReset(form.value.email).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Email envoyé',
          detail: 'Un email de réinitialisation a été envoyé.',
          closable: true,
          life: 5000,
        });
        this.router.navigate(['/auth/login']);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.error.set(
          err.error.error ?? 'Une erreur est survenue, veuillez réessayer.'
        );
        this.loading.set(false);
      },
    });
  }
}
