import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ButtonDirective } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';

import { ActivatedRoute, Router } from '@angular/router';

import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule, FloatLabel, ButtonDirective, InputText, Password],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  private auth$ = inject(AuthService);
  // get query params
  private routeSnapshot = inject(ActivatedRoute).snapshot;
  private router = inject(Router);

  error = signal('');

  destroy = new Subject<void>();
  loading = signal(false);

  submitForm(form: NgForm) {
    this.loading.set(true);
    this.auth$
      .login(form.value)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          if (this.routeSnapshot.queryParams['redirect']) {
            this.router.navigateByUrl(
              this.routeSnapshot.queryParams['redirect'],
            );
          } else {
            this.router.navigate(['/items']);
          }
        },
        error: (err) => {
          console.error(err);
          this.error.set(err.error.error);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
