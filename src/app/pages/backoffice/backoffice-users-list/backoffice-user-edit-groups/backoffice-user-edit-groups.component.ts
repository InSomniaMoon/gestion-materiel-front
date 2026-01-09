import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Structure } from '@app/core/types/structure.type';
import { UserGroup } from '@app/core/types/userStructure.type';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { BackofficeService } from '../../services/backoffice.service';

@Component({
  selector: 'app-backoffice-user-edit-groups',
  imports: [DialogModule, Button, ReactiveFormsModule, Select, FormsModule],
  template: `
    <div>
      @for (structure of userStructures(); track structure.id) {
        <div class="group">
          <span>{{ structure.name }}</span>
          <p-select
            [options]="rolesOptions"
            [(ngModel)]="structure.pivot.role"
            optionLabel="label"
            optionValue="value" />
          <p-button
            icon="pi pi-times"
            severity="danger"
            iconPos="right"
            (onClick)="removeGroup(structure)" />
        </div>
      }
      @if (toggleSelectNewGroup()) {
        <p-button
          label="Ajouter"
          severity="info"
          fluid="true"
          icon="pi pi-plus"
          (onClick)="toggleSelectNewGroup.set(false)" />
      } @else {
        <div class="flex">
          <p-select
            [filter]="true"
            filterBy="name"
            [options]="groupsWithoutUserGroups()"
            optionLabel="name"
            optionValue="id"
            #selectNewGroup />
          <p-button
            severity="success"
            icon="pi pi-plus"
            (onClick)="addGroup(selectNewGroup.value)" />
        </div>
      }
    </div>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="close()" />
      <p-button label="Mettre à jour" (onClick)="save()" />
    </p-footer>
  `,
  styleUrl: './backoffice-user-edit-groups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminUserEditGroupsComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly backofficeService = inject(BackofficeService);
  private readonly dialogRef = inject(DialogService);
  private data = this.dialogRef.getInstance(this.ref)!.data;

  toggleSelectNewGroup = signal(true);

  private _userGroups = this.backofficeService.getUserGroups(this.data.userId);
  userStructures = linkedSignal(() => this._userGroups.value());

  private _groups = toSignal(this.backofficeService.getGroups(), {
    initialValue: [],
  });

  groupsWithoutUserGroups = linkedSignal(() => {
    const userGroupIds = this.userStructures().map(g => g.id);
    return this._groups().filter(group => !userGroupIds.includes(group.id));
  });
  groups = computed<Structure[]>(() => this._groups());

  removeGroup(group: Structure) {
    this.userStructures.update(groups => groups.filter(g => g.id !== group.id));
  }

  addGroup(groupId: number) {
    const group = this.groupsWithoutUserGroups().find(g => g.id === groupId);
    if (group) {
      this.userStructures.update(groups => [
        ...groups,
        { ...group, pivot: { role: 'user' } },
      ]);
      this.toggleSelectNewGroup.set(true);
    }
  }
  close() {
    this.ref.close();
  }

  save() {
    this.backofficeService
      .updateUserGroups(
        this.data.userId,
        this.userStructures().map(
          g =>
            ({
              user_id: this.data.userId,
              structure_id: g.id,
              role: g.pivot.role,
            }) as UserGroup
        )
      )
      .subscribe({
        next: () => {
          this.ref.close(true);
        },
        error: err => {
          console.error('Error updating user groups:', err);
        },
      });
  }

  readonly rolesOptions = [
    {
      label: 'Utilisateur',
      value: 'user',
    },
    {
      label: 'Administrateur',
      value: 'admin',
    },
  ];
}
