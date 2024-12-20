import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemsService } from '@app/core/services/items.service';
import { AppTable } from '@components/ui/table/table.component';
import { OverlayOptions } from 'primeng/api';
import { Button } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select, SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-items-list',
  imports: [
    TableModule,
    PaginatorModule,
    Select,
    FormsModule,
    AppTable,
    SelectModule,
    Button,
    RouterLink,
  ],
  template: `
    <div class="header">
      <div class="flex">
        <h1>Items</h1>
        <p-select
          dropdownIcon="pi pi-filter"
          [checkmark]="true"
          [options]="[
            { label: 'Nom', value: 'name' },
            { label: 'Categorie', value: 'category' },
          ]"
          [(ngModel)]="orderBy"
        />
      </div>
      <p-button
        icon="pi pi-plus"
        label="Ajouter"
        routerLink="/admin/items/create"
      />
    </div>
    <matos-table [status]="items.status()">
      <p-table
        [value]="items.value()?.data ?? []"
        stripedRows
        [sortField]="orderBy()"
        (onSort)="orderBy.set($event.field)"
      >
        <ng-template #header>
          <tr>
            <th pSortableColumn="name">Nom <p-sortIcon field="name" /></th>
            <th pSortableColumn="category">
              Categorie <p-sortIcon field="category" />
            </th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
          </tr>
        </ng-template>
      </p-table>
      <div class="paginator">
        <span>Items par page: </span>
        <p-select
          [options]="options"
          optionLabel="label"
          optionValue="value"
          [ngModel]="size()"
          (ngModelChange)="page.set(0); size.set($event)"
          (listener)="log($event)"
        />
        <p-paginator
          [first]="page()"
          [rows]="size()"
          [totalRecords]="items.value()?.total ?? 0"
          (onPageChange)="onPageChange($event)"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="{first} - {last} of {totalRecords}"
          [showPageLinks]="false"
          [showFirstLastIcon]="false"
        />
      </div>
    </matos-table>
  `,
  styleUrl: './items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListComponent {
  private readonly itemService = inject(ItemsService);

  options = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];

  page = signal(0);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');

  items = resource({
    loader: ({ request }) => lastValueFrom(this.itemService.getItems(request)),
    request: () => ({
      page: this.page(),
      size: this.size(),
      searchQuery: this.searchQuery(),
      orderBy: this.orderBy(),
    }),
  });

  onPageChange(event: PaginatorState) {
    this.page.set(event.page! + 1);
    this.size.set(event.rows!);
  }

  log(loggable: any) {
    console.log(loggable);
  }
}
