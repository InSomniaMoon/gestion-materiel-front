import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-change-active-group',
  imports: [DialogModule, Button, Select, FormsModule],
  template: `
    <div class="modal-content">
      <p-select [options]="opt()" [ngModel]="selectedGroup()!.group_id" />
    </div>
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

  selectedGroup = this.authService.selectedGroup;

  opt = computed(() =>
    this.authService.groups().map((g) => ({ label: g.name, value: g.id })),
  );

  onResolve() {}
}
