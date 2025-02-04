import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { delay } from 'rxjs';
import { BackofficeService } from '../../services/backoffice.service';

@Component({
  selector: 'app-create-user-modal',
  imports: [
    ReactiveFormsModule,
    FloatLabel,
    Select,
    DialogModule,
    Button,
    InputText,
  ],
  template: `<form [formGroup]="form">
      <p-floatlabel>
        <p-select
          [options]="roles"
          optionLabel="name"
          optionValue="code"
          placeholder="Rôle"
          [showClear]="true"
          formControlName="role"
        />
        <label for="role">Role</label>
      </p-floatlabel>
      <p-floatlabel>
        <input id="username" pInputText formControlName="name" />
        <label for="username">Prénom et nom</label>
      </p-floatlabel>

      <p-floatlabel>
        <input id="email" type="email" pInputText formControlName="email" />
        <label for="emial">E-mail</label>
      </p-floatlabel>

      <p-floatlabel>
        <input id="phone" type="tel" pInputText formControlName="phone" />
        <label for="phone">Télephone <small>(optionnel)</small></label>
      </p-floatlabel>
    </form>

    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="ref.close()" />
      <p-button label="Créer" [disabled]="!form.valid" (onClick)="save()" />
    </p-footer>`,
  styleUrl: './create-user-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserModalComponent {
  readonly ref = inject(DynamicDialogRef);
  readonly dialogRef = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly backofficeService = inject(BackofficeService);
  private readonly toast = inject(MessageService);

  roles = [
    { name: 'Utilisateur', code: 'user' },
    { name: 'Administrateur', code: 'admin' },
  ];

  form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('test create', {
      validators: [Validators.required],
    }),
    email: this.fb.nonNullable.control('pierreleroyer69@gmail.com', {
      validators: [Validators.required, Validators.email],
    }),
    role: this.fb.nonNullable.control<string>('user', {
      validators: [Validators.required],
    }),
    phone: this.fb.control('', {}),
  });

  save() {
    this.backofficeService
      .createUser(this.form.getRawValue())
      // .pipe(delay(5000))
      .subscribe({
        next: (val) => {
          console.log(val);
          this.toast.add({
            detail: 'Utilisateur ajouté avec succès',
            severity: 'success',
          });
          this.ref.close(true);
        },
        error: (error) => {
          this.toast.add({
            detail: error.error.message,
            severity: 'error',
          });
          console.error(error.error.message);
        },
      });
  }
}
