import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
} from '@angular/core';
import { AppTable } from '@app/components/ui/table/table.component';
import { StructuresService } from '@app/core/services/structures.service';
import { Structure } from '@app/core/types/structure.type';
import { TippyDirective } from '@ngneat/helipopper';
import { buildDialogOptions } from '@utils/constants';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { CreateUnitComponent } from './create-structure/create-unit.component';

@Component({
  selector: 'app-children-structures-list',
  imports: [AppTable, Button, TableModule, TippyDirective],
  templateUrl: './children-structures-list.component.html',
  styleUrl: './children-structures-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildrenStructuresListComponent {
  private readonly dialogService = inject(DialogService);

  structures = model.required<Structure[]>();
  private readonly structuresService = inject(StructuresService);

  openCreateUnitDialog() {
    this.dialogService
      .open(
        CreateUnitComponent,
        buildDialogOptions({
          header: 'Créer une unité',
          width: '50%',
          height: '80%',
        })
      )!
      .onClose.subscribe(result => {
        if (!result) {
          return;
        }

        console.log('Creating unit with data:', result);
      });
  }

  openUpdateUnitDialog(unit: any) {
    this.dialogService
      .open(
        CreateUnitComponent,
        buildDialogOptions({
          header: "Modifier l'unité",
          width: '50%',
          height: '80%',
          data: unit,
          inputValues: {
            structure: unit,
          },
        })
      )!
      .onClose.subscribe(result => {
        if (!result) {
          return;
        }
        console.log(result);

        this.structuresService
          .updateStructure(unit.id, {
            color: result.color,
            name: result.name,
            members: result.chiefs,
          })
          .subscribe({
            next: struct => {
              this.structures.set([
                ...this.structures().map(s =>
                  s.id === unit.id ? struct.structure : s
                ),
              ]);
            },
            error: error => {
              console.error(
                "Erreur pendant la mise à jour de l'unité :",
                error
              );
            },
          });
      });
  }

  showChiefsList = signal(false);

  toggleShowChiefsList() {
    this.showChiefsList.set(!this.showChiefsList());
  }
}
