import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Group } from '@app/core/types/group.type';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select, SelectChangeEvent } from 'primeng/select';
import { BackofficeService } from '../../services/backoffice.service';

@Component({
  selector: 'app-app-admin-user-edit-groups',
  imports: [DialogModule, Button, ReactiveFormsModule, Select, JsonPipe],
  template: ` <form [formGroup]="form">
      <div class="groups-to-add">
        <h3>Groupes disponibles</h3>
        @for (group of groups(); track $index) {
        <p-button
          [label]="group.name"
          icon="pi pi-plus"
          severity="secondary"
          iconPos="right"
          (onClick)="addGroup(group)"
        />
        }
      </div>

      <div class="added-groups">
        <h3>Groupes ajoutés</h3>

        @for (group of userGroups.value(); track $index) {
        <div class="group">
          <span [class.changed]="hasGroupChanged(group.group!)">{{
            group.group?.name
          }}</span>
          <p-select
            [options]="rolesOptions"
            (onChange)="groupChanged(group.group!, $event)"
            optionLabel="label"
            optionValue="value"
          />
          <p-button icon="pi pi-times" severity="danger" iconPos="right" />
        </div>
        }
      </div>

      <div class="removed-groups">
        <h3>Groupes supprimés</h3>
      </div>
    </form>

    <p-footer>
      <pre>{{ form.value | json }}</pre>
      <p-button label="Fermer" severity="secondary" (onClick)="close()" />
      <p-button
        label="Créer"
        [disabled]="!form.valid || !form.touched"
        (onClick)="save()"
      />
    </p-footer>`,
  styleUrl: './app-admin-user-edit-groups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminUserEditGroupsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(DynamicDialogRef);
  private readonly backofficeService = inject(BackofficeService);
  private readonly dialogRef = inject(DialogService);

  private data = this.dialogRef.getInstance(this.ref).data;

  userGroups = this.backofficeService.getUserGroups(this.data.userId);

  _groups = toSignal(this.backofficeService.getGroups(), {
    initialValue: [],
  });
  groups = computed(() =>
    this._groups()
      .filter(
        (group) =>
          !this.userGroups
            .value()
            .map((ug) => ug.group_id)
            .includes(group.id)
      )
      .filter(
        (group) =>
          !this.form
            .get('groups_to_add')!
            .value.map((g) => g.id)
            .includes(group.id)
      )
      .filter(
        (group) =>
          !this.form
            .get('groups_to_update')!
            .value.map((g) => g.id)
            .includes(group.id)
      )
      .filter(
        (group) => !this.form.get('groups_to_remove')!.value.includes(group.id)
      )
  );

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

  form = this.fb.nonNullable.group({
    groups_to_add: this.fb.nonNullable.control<{ id: number; role: string }[]>(
      []
    ),
    groups_to_update: this.fb.nonNullable.control<
      { id: number; role: string }[]
    >([]),
    groups_to_remove: this.fb.nonNullable.control<number[]>([]),
  });

  close() {
    this.ref.close();
  }

  save() {
    this.ref.close();
  }

  hasGroupChanged(group: Group) {
    const groupsToUpdate = this.form.get('groups_to_update')!;
    return groupsToUpdate.value.map((g) => g.id).includes(group.id);
  }

  addGroup(group: Group) {
    const groups = this.form.get('groups_to_add')!;
    if (groups.value.map((g) => g.id).includes(group.id)) {
      return;
    }
    console.log(groups.value);
    groups.setValue([...groups.value, { id: group.id, role: 'user' }]);
  }

  groupChanged(group: Group, event: SelectChangeEvent) {
    const groups_to_update = this.form.get('groups_to_update')!;
    if (groups_to_update.value.map((g) => g.id).includes(group.id)) {
      return;
    }
    console.log(groups_to_update.value);
    groups_to_update.setValue([
      ...groups_to_update.value,
      { id: group.id, role: event.value },
    ]);
  }
}
