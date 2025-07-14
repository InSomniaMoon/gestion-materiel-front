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
import { Button } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select, SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { DatePipe } from '@angular/common';
import { AuthService } from '@app/core/services/auth.service';

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
    SearchBarComponent,
    DatePipe,
  ],
  template: `
    <div class="header">
      <div class="flex">
        <h1>Objets</h1>
        <app-search-bar (queryChange)="searchQuery.set($event)" />
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
            <th pSortableColumn="category_id">
              Categorie <p-sortIcon field="category_id" />
            </th>
            <th>Date d'achat</th>
            <th>Avaries</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td>{{ product.name }}</td>
            <td>{{ product.category.name }}</td>
            <td>{{ product.date_of_buy | date }}</td>
            <td></td>
            <td class="actions">
              <p-button
                icon="pi pi-pencil"
                routerLink="/admin/items/{{ product.id }}"
                size="small"
              />
            </td>
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
        />
        <p-paginator
          [first]="page()"
          [rows]="size()"
          [totalRecords]="items.value()?.total ?? 0"
          (onPageChange)="onPageChange($event)"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="{first} - {last} sur {totalRecords}"
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
  private readonly authService = inject(AuthService);

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
      q: this.searchQuery(),
      order_by: this.orderBy(),
      activeGroup: this.authService.selectedGroup(),
    }),
  });

  onPageChange(event: PaginatorState) {
    this.page.set(event.page! + 1);
    this.size.set(event.rows!);
  }
}
