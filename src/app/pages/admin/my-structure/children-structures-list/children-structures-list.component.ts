import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AppTable } from '@app/components/ui/table/table.component';
import { StructuresService } from '@app/core/services/structures.service';
import { Structure } from '@app/core/types/structure.type';
import { environment } from '@env/environment';
import { TippyDirective } from '@ngneat/helipopper';
import { buildDialogOptions } from '@utils/constants';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { CreateStructureComponent } from './create-structure/create-structure.component';

@Component({
  selector: 'app-children-structures-list',
  imports: [AppTable, Button, TableModule, TippyDirective],
  templateUrl: './children-structures-list.component.html',
  styleUrl: './children-structures-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildrenStructuresListComponent {
  private readonly dialogService = inject(DialogService);
  readonly baseUrl = environment.api_url;
  structures = input.required<Structure[]>();
  structuresChanged = output<void>();
  private readonly structuresService = inject(StructuresService);

  openCreateUnitDialog() {
    this.dialogService
      .open(
        CreateStructureComponent,
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
        CreateStructureComponent,
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
        this.structuresService
          .updateStructure(unit.id, {
            color: result.color,
            name: result.details.name,
            image: result.details.image,
            members: result.chiefs,
          })
          .subscribe({
            next: () => {
              this.structuresChanged.emit();
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
