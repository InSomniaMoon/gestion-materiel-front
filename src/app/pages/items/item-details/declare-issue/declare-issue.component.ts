import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemIssuesService } from '@app/core/services/item-issues.service';
import { Item } from '@app/core/types/item.type';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
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
    InputText,
  ],
  template: ` <form [formGroup]="form">
      <p-float-label variant="on">
        <textarea
          pTextarea
          id="issue"
          formControlName="issue"
          fluid
          rows="5"></textarea>

        <label for="issue">Problème repéré</label>
      </p-float-label>

      @if (!item().category?.identified) {
        <p-float-label variant="on">
          <input
            type="number"
            formControlName="affected_quantity"
            id="affected_quantity"
            max="{{ item().stock }}"
            pInputText />
          <label for="affected_quantity"
            >Quantité affectée (max. {{ item().stock }})</label
          >
        </p-float-label>
      }

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
        (onClick)="declareIssue()" />
    </p-footer>`,
  styleUrl: './declare-issue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclareIssueComponent implements OnInit {
  ref = inject(DynamicDialogRef);
  dialogService = inject(DialogService);
  private readonly itemIssuesService = inject(ItemIssuesService);
  private readonly messageService = inject(MessageService);
  item = input.required<Item>();

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    issue: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    usable: this.fb.nonNullable.control(true),
    itemId: this.fb.nonNullable.control<number>(0, {
      validators: [Validators.required],
    }),
    affected_quantity: this.fb.nonNullable.control<number>(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  ngOnInit(): void {
    this.form.patchValue({ itemId: this.item().id });
  }

  declareIssue() {
    if (!this.form.valid) return;
    this.itemIssuesService
      .create(this.form.getRawValue(), this.item().id)
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
