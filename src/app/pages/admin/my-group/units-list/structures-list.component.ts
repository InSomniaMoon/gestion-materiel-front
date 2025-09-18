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
import { CreateUnitComponent } from './create-unit/create-unit.component';

@Component({
  selector: 'app-units-list',
  imports: [AppTable, Button, TableModule, TippyDirective],
  templateUrl: './structures-list.component.html',
  styleUrl: './structures-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructuresListComponent {
  private readonly dialogService = inject(DialogService);

  units = input.required<Structure[]>();

  openUpdateUnitDialog(structure: any) {
    this.dialogService
      .open(
        CreateUnitComponent,
        buildDialogOptions({
          header: "Modifier l'unité",
          width: '50%',
          height: '80%',
          data: structure,
          inputValues: {
            structure,
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
