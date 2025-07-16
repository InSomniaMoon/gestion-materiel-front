import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { AuthService } from '@app/core/services/auth.service';
import { ItemsService } from '@app/core/services/items.service';
import { Item } from '@app/core/types/item.type';
import { AppTable } from '@components/ui/table/table.component';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select, SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { CreateItemComponent } from './create-item/create-item.component';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '@app/components/simple-modal/simple-modal.component';
import { environment } from '@env/environment';

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
        (onClick)="openCreateItem()" />
    </div>
    <matos-table [status]="items.status()">
      <p-table
        [value]="items.value()?.data ?? []"
        stripedRows
        [sortField]="orderBy()"
        (onSort)="orderBy.set($event.field)">
        <ng-template #header>
          <tr>
            <th></th>
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
            <td class="image">
              @if (product.image) {
                <img [src]="baseUrl + product.image" alt="" />
              }
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.category.name }}</td>
            <td style="text-wrap: nowrap;">{{ product.date_of_buy | date }}</td>
            <td style="text-wrap: nowrap;"></td>
            <td class="actions">
              <p-button
                icon="pi pi-pencil"
                size="small"
                (onClick)="openUpdateItem(product)" />
              <p-button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                (onClick)="deleteItem(product)" />
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
          (ngModelChange)="page.set(0); size.set($event)" />
        <p-paginator
          [first]="page()"
          [rows]="size()"
          [totalRecords]="items.value()?.total ?? 0"
          (onPageChange)="onPageChange($event)"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="{first} - {last} sur {totalRecords}"
          [showPageLinks]="false"
          [showFirstLastIcon]="false" />
      </div>
    </matos-table>
  `,
  styleUrl: './items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListComponent {
  private readonly itemService = inject(ItemsService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  options = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];
  baseUrl = environment.api_url + '/storage/';

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

  openCreateItem() {
    this.dialogService
      .open(CreateItemComponent, {
        header: 'Créer un objet',
        width: '70%',
        height: '80%',
        modal: true,
        dismissableMask: true,
      })
      .onClose.subscribe(created => {
        if (created) {
          this.items.reload();
        }
      });
  }

  openUpdateItem(item: Item) {
    this.dialogService
      .open(CreateItemComponent, {
        header: 'Modifier un objet',
        width: '70%',
        height: '80%',
        modal: true,
        dismissableMask: true,
        data: item,
      })
      .onClose.subscribe(updated => {
        if (updated) {
          this.items.reload();
        }
      });
  }

  deleteItem(item: Item) {
    this.dialogService
      .open<SimpleModalComponent, SimpleModalData>(SimpleModalComponent, {
        header: 'Supprimer ' + item.name,
        width: '50%',
        modal: true,
        dismissableMask: true,
        data: {
          message: `Êtes-vous sûr de vouloir supprimer l'objet "${item.name}" ?`,
          cancelText: 'Annuler',
          confirmText: 'Supprimer',
          confirm: true,
        },
      })
      .onClose.subscribe(confirmed => {
        if (confirmed) {
          this.itemService.deleteItem(item).subscribe(() => {
            this.items.reload();
          });
        }
      });
  }
}
