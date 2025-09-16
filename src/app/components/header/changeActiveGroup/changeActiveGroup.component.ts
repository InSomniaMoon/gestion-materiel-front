import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-change-active-group',
  imports: [DialogModule, Button, Select, ReactiveFormsModule],
  template: `
    <form class="modal-content" [formGroup]="form">
      <p-select [options]="opt()" formControlName="structure_id" />
    </form>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="ref.close()" />
      <p-button label="Resoudre" (onClick)="onResolve()" />
    </p-footer>
  `,
  styleUrl: './changeActiveGroup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeActiveGroupComponent {
  ref = inject(DynamicDialogRef);
  dialogService = inject(DialogService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  selectedGroup = this.authService.selectedStructure;

  form = this.fb.group({
    structure_id: [this.selectedGroup()?.id],
  });

  opt = computed(() =>
    this.authService.structures().map(g => ({ label: g.name, value: g.id }))
  );

  onResolve() {
    this.ref.close(this.form.getRawValue());
  }
}
