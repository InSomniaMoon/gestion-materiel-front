import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Item } from '@core/types/item.type';
import { OptionIssuesService } from '@services/option-issues.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-declare-option-issue',
  imports: [
    DialogModule,
    Button,
    ReactiveFormsModule,
    Textarea,
    FloatLabel,
    ToggleSwitch,
    Select,
  ],
  template: `<form [formGroup]="form">
      <p-float-label variant="on">
        <p-select
          formControlName="optionId"
          [options]="options()"
          optionLabel="name"
          optionValue="id"
          fluid
          id="option" />
        <label for="option">Option</label>
      </p-float-label>

      <p-float-label variant="on">
        <textarea
          pTextarea
          id="issue"
          formControlName="issue"
          fluid
          rows="5"></textarea>

        <label for="issue">Avarie repérée</label>
      </p-float-label>

      <label
        for="usable"
        style="display: flex; gap: 0.5rem; align-items: center;">
        <p-toggle-switch formControlName="usable" id="usable" />
        Utilisabilité de l'objet
      </label>
    </form>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="ref.close()" />
      <p-button
        label="Déclarer"
        [disabled]="form.invalid"
        (onClick)="declareAvarie()" />
    </p-footer>`,
  styleUrl: './declareOptionIssue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclareOptionIssueComponent {
  ref = inject(DynamicDialogRef);
  dialogService = inject(DialogService);
  private readonly optionIssuesService = inject(OptionIssuesService);
  private readonly messageService = inject(MessageService);

  item = input.required<Item>();
  options = computed(() => this.item()?.options || []);

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    issue: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    usable: this.fb.nonNullable.control(true),
    optionId: this.fb.nonNullable.control(null, {
      validators: [Validators.required],
    }),
  });

  declareAvarie() {
    if (!this.form.valid) return;
    this.optionIssuesService
      .create(
        this.form.getRawValue(),
        this.item().id,
        this.form.value.optionId!
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
        error: err => {
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
