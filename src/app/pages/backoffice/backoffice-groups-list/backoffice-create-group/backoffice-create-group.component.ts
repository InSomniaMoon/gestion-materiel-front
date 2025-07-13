import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BackofficeService } from '../../services/backoffice.service';

@Component({
  selector: 'app-backoffice-create-group',
  imports: [
    DialogModule,
    Button,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Textarea,
  ],
  template: ` <form [formGroup]="form">
      <p-float-label>
        <input pInputText formControlName="name" />
        <label>Nom du groupe</label>
      </p-float-label>
      <p-float-label>
        <textarea
          pTextarea
          cols="auto"
          rows="6"
          formControlName="description"
        ></textarea>
        <label>Description (optionnel)</label>
      </p-float-label>
    </form>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="ref.close()" />
      <p-button
        label="Créer"
        [disabled]="!form.valid || saveClicked()"
        (onClick)="save()"
        [loading]="saveClicked()"
      />
    </p-footer>`,
  styleUrl: './backoffice-create-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminCreateGroupComponent {
  readonly ref = inject(DynamicDialogRef);
  readonly dialogRef = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly backofficeService = inject(BackofficeService);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  saveClicked = signal(false);

  form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', {
      validators: [Validators.required],
    }),
    description: this.fb.control(''),
  });

  save() {
    this.saveClicked.set(true);
    this.backofficeService
      .createGroup(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: 'Groupe créé',
            detail: 'Le groupe a été créé avec succès',
          });

          this.ref.close(true);
        },
        error: () => {
          this.toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la création du groupe',
          });
        },
        complete: () => {
          this.saveClicked.set(false);
        },
      });
  }
}
