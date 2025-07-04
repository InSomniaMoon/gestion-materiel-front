import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OptionIssuesService } from '@app/core/services/option-issues.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-declare-option-issue',
  imports: [
    DialogModule,
    Button,
    ReactiveFormsModule,
    FloatLabel,
    ToggleSwitch,
  ],
  template: `<form [formGroup]="form">
      <p-floatLabel variant="on">
        <textarea
          pTextarea
          id="issue"
          formControlName="issue"
          style="width:100%"
        ></textarea>
        <label for="issue">Problème repéré</label>
      </p-floatLabel>

      <label for="usable">
        <p-toggle-switch formControlName="usable" id="usable" />
        Utilisabilité de l'objet
      </label>
    </form>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="ref.close()" />
      <p-button
        label="Déclarer"
        [disabled]="!form.valid"
        (onClick)="declareAvarie()"
      />
    </p-footer>`,
  styleUrl: './declareOptionIssue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclareOptionIssueComponent {
  ref = inject(DynamicDialogRef);
  dialogService = inject(DialogService);
  private readonly optionIssuesService = inject(OptionIssuesService);
  private readonly messageService = inject(MessageService);

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    issue: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    usable: this.fb.control(true, { nonNullable: true }),
  });

  declareAvarie() {
    if (!this.form.valid) return;

    this.optionIssuesService
      .create(
        this.form.getRawValue(),
        this.dialogService.getInstance(this.ref).data.itemId,
        this.dialogService.getInstance(this.ref).data.optionId
      )
      .subscribe({
        next: () => {
          this.ref.close(this.form.getRawValue().usable);
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'La déclaration a été effectuée avec succès.',
          });
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la déclaration.',
          });
        },
      });
  }
}
