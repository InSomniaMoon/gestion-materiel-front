import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { AppTable } from '@app/components/ui/table/table.component';
import { Structure } from '@app/core/types/structure.type';
import { TippyDirective } from '@ngneat/helipopper';
import { buildDialogOptions } from '@utils/constants';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { CreateUnitComponent } from './create-structure/create-unit.component';

@Component({
  selector: 'app-units-list',
  imports: [AppTable, Button, TableModule, TippyDirective],
  templateUrl: './children-structures-list.component.html',
  styleUrl: './children-structures-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildrenStructuresListComponent {
  private readonly dialogService = inject(DialogService);

  units = input.required<Structure[]>();

  openCreateUnitDialog() {
    this.dialogService
      .open(
        CreateUnitComponent,
        buildDialogOptions({
          header: 'Créer une unité',
          width: '50%',
          height: '80%',
        })
      )
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
      )
      .onClose.subscribe(result => {
        if (!result) {
          return;
        }

        //   this.unitsService
        //     .updateUnit(unit.id, {
        //       color: result.color,
        //       name: result.name,
        //       chiefs: result.chiefs,
        //       responsible: result.responsible,
        //     })
        //     .subscribe({
        //       next: () => {
        //         this.units.reload();
        //       },
        //       error: error => {
        //         console.error(
        //           "Erreur pendant la mise à jour de l'unité :",
        //           error
        //         );
        //       },
        //     });
      });
  }

  showChiefsList = signal(false);

  toggleShowChiefsList() {
    this.showChiefsList.set(!this.showChiefsList());
  }
}
