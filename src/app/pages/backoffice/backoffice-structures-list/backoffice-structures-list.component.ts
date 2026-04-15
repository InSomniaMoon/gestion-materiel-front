import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@app/components/ui/paginator/paginator.component';
import { AppTable } from '@app/components/ui/table/table.component';
import { TableLayoutService } from '@app/core/services/table-layout.service';
import { StructureWithPivot } from '@app/core/types/structure.type';
import { debounceTimeSignal } from '@app/core/utils/signals.utils';
import { environment } from '@env/environment';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { buildDialogOptions } from '@utils/constants';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DataView } from 'primeng/dataview';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule, TablePageEvent } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { BackofficeService } from '../services/backoffice.service';
import { CreateUpdateStructureComponent } from './backoffice-create-update-structure/backoffice-create-update-structure.component';

@Component({
  selector: 'app-backoffice-structures-list',
  imports: [
    TableModule,
    FormsModule,
    IconFieldModule,
    InputTextModule,
    InputIcon,
    Button,
    AppTable,
    DataView,
    SelectButton,
    PaginatorComponent,
    Card,
    Badge,
  ],
  template: `
    <matos-table [status]="structuresQuery.status()">
      <p-data-view [value]="structures()" [layout]="layout()">
        <ng-template #header>
          <div class="flex justify-between align-items-center">
            <p-iconfield iconPosition="left" style="width: 100%;">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (ngModelChange)="q.set($event)"
                ngModel
                placeholder="Rechercher une structure" />
            </p-iconfield>
            <div class="caption">
              <p-button
                label="Ajouter"
                icon="pi pi-plus"
                (onClick)="openCreateStructureDialog()" />
            </div>
            <p-select-button
              [ngModel]="layout"
              (ngModelChange)="setLayout($event)"
              [options]="dataViewType"
              [allowEmpty]="false"
              size="small">
              <ng-template #item let-option>
                <i
                  [class]="
                    option.value === 'list' ? 'pi pi-bars' : 'pi pi-table'
                  "></i>
              </ng-template>
            </p-select-button>
          </div>
        </ng-template>
        <ng-template #list let-items>
          <p-table
            [value]="structures()"
            [rows]="size()"
            [rowsPerPageOptions]="[10, 25, 50]"
            [sortField]="orderBy()"
            [sortOrder]="sortOrder()"
            (onPage)="pageChange($event)">
            <ng-template #header>
              <tr>
                <th></th>
                <th>Nom</th>
                <th></th>
              </tr>
            </ng-template>
            <ng-template #body let-structure>
              <tr>
                <td class="image">
                  @if (structure.image) {
                    <img
                      [src]="baseUrl + structure.image"
                      width="32px"
                      height="32px" />
                  }
                </td>
                <td>{{ structure.name }}</td>
                <td>
                  <p-button
                    icon="pi pi-pencil"
                    severity="secondary"
                    (onClick)="openUpdateStructureDialog(structure)" />
                </td>
              </tr>
            </ng-template>
          </p-table>
        </ng-template>

        <ng-template #grid let-items>
          <div class="grid">
            @for (structure of items; track structure.id) {
              <p-card (click)="openUpdateStructureDialog(structure)">
                <ng-template #header>
                  <div class="flex">
                    <p-badge
                      badgeSize="small"
                      value=" "
                      [style]="{ 'background-color': structure.color }" />
                    <h3>{{ structure.name }}</h3>
                  </div>
                </ng-template>

                <div>
                  {{ structure.description }}
                </div>
              </p-card>
            }
          </div>
        </ng-template>
      </p-data-view>
      <app-paginator
        [(page)]="page"
        [(size)]="size"
        [totalRecords]="structuresQuery.data()?.total ?? 0" />
    </matos-table>
  `,

  styleUrl: './backoffice-structures-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminStructuresListComponent {
  private readonly backofficeService = inject(BackofficeService);
  private readonly dialogService = inject(DialogService);
  private readonly tableLayoutService = inject(TableLayoutService);

  baseUrl = environment.api_url + '/storage/';

  page = signal(0);
  size = signal(25);
  orderBy = signal('name');
  sortBy = signal('asc');
  sortOrder = computed(() => (this.sortBy() === 'asc' ? 1 : -1));
  q = signal('');
  debouncedQ = debounceTimeSignal(this.q, 500);

  dataViewType = [
    { label: 'Liste', value: 'list' },
    { label: 'Tableau', value: 'grid' },
  ];
  layout = this.tableLayoutService.layout;
  setLayout(layout: 'list' | 'grid') {
    this.tableLayoutService.setLayout(layout);
  }

  structuresQuery = injectQuery(() => ({
    queryKey: [
      'structures',
      {
        page: this.page(),
        q: this.debouncedQ(),
        size: this.size(),
        orderBy: this.orderBy(),
        sortBy: this.sortBy(),
      },
    ],
    queryFn: () =>
      lastValueFrom(
        this.backofficeService.getStructures({
          orderBy: this.orderBy(),
          page: this.page() + 1,
          q: this.q(),
          size: this.size(),
          sortBy: this.sortBy(),
        })
      ),
  }));

  structures = computed(() => this.structuresQuery.data()?.data || []);

  openCreateStructureDialog() {
    this.dialogService
      .open(
        CreateUpdateStructureComponent,
        buildDialogOptions({
          header: 'Créer une structure',
          width: '70%',
        })
      )!
      .onClose.subscribe(created => {
        if (created) {
          this.structuresQuery.refetch();
        }
      });
  }

  openUpdateStructureDialog(structure: StructureWithPivot) {
    this.dialogService
      .open(
        CreateUpdateStructureComponent,
        buildDialogOptions({
          header: `Modifier le structuree ${structure.name}`,
          width: '70%',
          data: { structure },
        })
      )!
      .onClose.subscribe(updated => {
        if (updated) {
          this.structuresQuery.refetch();
        }
      });
  }

  pageChange(event: TablePageEvent) {
    console.log(event);
    this.size.set(event.rows);

    this.page.set(Math.floor(event.first / event.rows) + 1);
  }
}
