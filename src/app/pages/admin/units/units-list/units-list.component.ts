import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
} from '@angular/core';
import { AppTable } from '@app/components/ui/table/table.component';
import { UnitsService } from '@app/core/services/units.service';
import { lastValueFrom } from 'rxjs';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateUnitComponent } from './create-unit/create-unit.component';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-units-list',
  imports: [AppTable, Select, Button, TableModule],
  templateUrl: './units-list.component.html',
  styleUrl: './units-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsListComponent {
  unitsService = inject(UnitsService);
  private readonly dialogService = inject(DialogService);

  units = resource({
    loader: () => lastValueFrom(this.unitsService.getUnits()),
  });
  status = this.units.status;

  openCreateUnitDialog() {
    this.dialogService
      .open(CreateUnitComponent, {
        dismissableMask: true,
        header: 'Créer une unité',
        modal: true,
        closable: true,
        width: '50%',
        height: '80%',
        data: {
          onCreate: () => {
            this.units.reload();
          },
        },
      })
      .onClose.subscribe((result) => {
        if (!result) {
          return;
        }

        console.log('Creating unit with data:', result);

        this.unitsService
          .createUnit({
            color: result.color,
            name: result.name,
            chiefs: result.chiefs,
            responsible: result.responsible,
          })
          .subscribe({
            next: () => {
              this.units.reload();
            },
            error: (error) => {
              console.error("Erreur pendant la création de l'unité :", error);
            },
          });
      });
  }

  openUpdateUnitDialog(unit: any) {
    this.dialogService
      .open(CreateUnitComponent, {
        dismissableMask: true,
        header: "Modifier l'unité",
        modal: true,
        closable: true,
        width: '50%',
        height: '80%',
        data: unit,
      })
      .onClose.subscribe((result) => {
        if (!result) {
          return;
        }
      });
  }
}
