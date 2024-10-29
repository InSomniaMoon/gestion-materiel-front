import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { ButtonDirective } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AuthService } from '../../../core/services/auth.service';

import { ActivatedRoute, Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, FloatLabelModule, ButtonDirective, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  private auth$ = inject(AuthService);
  // get query params
  private routeSnapshot = inject(ActivatedRoute).snapshot;
  private router = inject(Router);

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
            this.router.navigate([this.routeSnapshot.queryParams['redirect']]);
          } else {
            this.router.navigate(['/items']);
          }
        },
        error: (err) => {
          console.error(err);
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
