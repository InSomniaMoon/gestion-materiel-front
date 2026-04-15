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
import { UserStructure } from '@app/core/types/userStructure.type';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { BackofficeService } from '../../services/backoffice.service';

@Component({
  selector: 'app-backoffice-user-edit-structures',
  imports: [DialogModule, Button, ReactiveFormsModule, Select, FormsModule],
  template: `
    <div>
      @for (structure of userStructures(); track structure.id) {
        <div class="structure">
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
            (onClick)="removeStructure(structure)" />
        </div>
      }
      @if (toggleSelectNewStructure()) {
        <p-button
          label="Ajouter"
          severity="info"
          fluid="true"
          icon="pi pi-plus"
          (onClick)="toggleSelectNewStructure.set(false)" />
      } @else {
        <div class="flex">
          <p-select
            [filter]="true"
            filterBy="name"
            [options]="structuresWithoutUserStructures()"
            optionLabel="name"
            optionValue="id"
            #selectNewStructure />
          <p-button
            severity="success"
            icon="pi pi-plus"
            (onClick)="addStructure(selectNewStructure.value)" />
        </div>
      }
    </div>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="close()" />
      <p-button label="Mettre à jour" (onClick)="save()" />
    </p-footer>
  `,
  styleUrl: './backoffice-user-edit-structures.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminUserEditStructuresComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly backofficeService = inject(BackofficeService);
  private readonly dialogRef = inject(DialogService);
  private readonly data = this.dialogRef.getInstance(this.ref)!.data;

  toggleSelectNewStructure = signal(true);

  private readonly _userStructures = this.backofficeService.getUserStructures(
    this.data.userId
  );
  userStructures = linkedSignal(() => this._userStructures.value());

  private readonly _structures = toSignal(
    this.backofficeService.getStructures(),
    {
      initialValue: [],
    }
  );

  structuresWithoutUserStructures = linkedSignal(() => {
    const userStructureIds = new Set(this.userStructures().map(g => g.id));
    return this._structures().filter(
      structure => !userStructureIds.has(structure.id)
    );
  });
  structures = computed<Structure[]>(() => this._structures());

  removeStructure(structure: Structure) {
    this.userStructures.update(structures =>
      structures.filter(g => g.id !== structure.id)
    );
  }

  addStructure(structureId: number) {
    const structure = this.structuresWithoutUserStructures().find(
      g => g.id === structureId
    );
    if (structure) {
      this.userStructures.update(structures => [
        ...structures,
        { ...structure, pivot: { role: 'user' } },
      ]);
      this.toggleSelectNewStructure.set(true);
    }
  }
  close() {
    this.ref.close();
  }

  save() {
    this.backofficeService
      .updateUserStructures(
        this.data.userId,
        this.userStructures().map(
          g =>
            ({
              user_id: this.data.userId,
              structure_id: g.id,
              role: g.pivot.role,
            }) as UserStructure
        )
      )
      .subscribe({
        next: () => {
          this.ref.close(true);
        },
        error: err => {
          console.error('Error updating user structures:', err);
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
