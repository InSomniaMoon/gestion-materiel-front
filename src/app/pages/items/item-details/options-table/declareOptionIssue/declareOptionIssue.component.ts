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
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'app-declare-option-issue',
  imports: [JsonPipe, DialogModule, Button, ReactiveFormsModule, FloatLabel],
  template: `<p>declareOptionIssue works!</p>
    <pre>{{ this.dialogService.getInstance(this.ref).data | json }}</pre>
    <form [formGroup]="form">
      <p-floatLabel variant="on">
        <textarea pTextarea id="value" formControlName="value"></textarea>
        <label for="value">Problème repéré</label>
      </p-floatLabel>
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
  private readonly destroyRef = inject(DestroyRef);

  fb = inject(FormBuilder);
  form = this.fb.group({
    value: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  declareAvarie() {
    if (!this.form.valid) return;

    this.optionIssuesService
      .create(
        this.form.value.value!,
        this.dialogService.getInstance(this.ref).data.itemId,
        this.dialogService.getInstance(this.ref).data.optionId,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.ref.close(true);
      });
  }
}
