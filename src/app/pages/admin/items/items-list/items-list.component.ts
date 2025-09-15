import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '@app/components/simple-modal/simple-modal.component';
import { PaginatorComponent } from '@app/components/ui/paginator/paginator.component';
import { AppTable } from '@components/ui/table/table.component';
import { Item } from '@core/types/item.type';
import { environment } from '@env/environment';
import { ItemsService } from '@services/items.service';
import { buildDialogOptions } from '@utils/constants';
import { Badge } from 'primeng/badge';
import { Button, ButtonDirective } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { CreateItemComponent } from './create-item/create-item.component';
@Component({
  selector: 'app-items-list',
  imports: [
    TableModule,
    PaginatorModule,
    FormsModule,
    AppTable,
    SelectModule,
    Button,
    SearchBarComponent,
    DatePipe,
    Badge,
    RouterLink,
    ButtonDirective,
    PaginatorComponent,
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
        [sortOrder]="sortBy()"
        (onSort)="orderBy.set($event.field); sortBy.set($event.order)">
        <ng-template #header>
          <tr>
            <th pSortableColumn="state">Etat<p-sortIcon field="state" /></th>
            <th></th>
            <th pSortableColumn="name">Nom<p-sortIcon field="name" /></th>
            <th pSortableColumn="category_id">
              Categorie <p-sortIcon field="category_id" />
            </th>
            <th pSortableColumn="open_option_issues_count">
              Avaries
              <p-sortIcon field="open_option_issues_count" />
            </th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td class="image">
              <p-badge
                size="small"
                value=" "
                [severity]="
                  product.state === 'OK'
                    ? 'success'
                    : product.state === 'NOK'
                      ? 'warn'
                      : product.state === 'KO'
                        ? 'danger'
                        : 'info'
                " />
            </td>
            <td class="image">
              @if (product.image) {
                <img [src]="baseUrl + product.image" alt="" />
              }
            </td>
            <td>{{ product.name }}</td>
            <td style="text-wrap: nowrap;">{{ product.category.name }}</td>
            <td style="text-wrap: nowrap;text-align: center;">
              {{ product.open_option_issues_count }}
            </td>
            <td class="actions">
              <a
                pButton
                [routerLink]="['/items', product.id]"
                size="small"
                severity="info"
                icon="pi pi-eye">
              </a>
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
      <app-paginator
        [(page)]="page"
        [(size)]="size"
        [totalRecords]="items.value()?.total ?? 0"
        [options]="options" />
    </matos-table>
  `,
  styleUrl: './items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListComponent {
  private readonly itemService = inject(ItemsService);
  private readonly dialogService = inject(DialogService);

  constructor() {
    effect(() => {
      this.orderBy();
      this.sortBy();
      this.page.set(0);
    });
  }
  options = [
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '250', value: 250 },
  ];
  baseUrl = environment.api_url + '/storage/';

  page = signal(0);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');
  sortBy = signal<1 | -1>(1);
  first = computed(() => this.page() * this.size());

  items = resource({
    loader: ({ params }) => {
      return lastValueFrom(
        this.itemService.getAdminItems({ ...params, page: params.page + 1 })
      );
    },
    params: () => ({
      page: this.page(),
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: this.sortBy() === 1 ? 'asc' : 'desc',
    }),
  });

  openCreateItem() {
    this.dialogService
      .open(
        CreateItemComponent,
        buildDialogOptions({
          header: 'Créer un objet',
          width: '70%',
          height: '80%',
        })
      )
      .onClose.subscribe(created => {
        if (created) {
          this.items.reload();
        }
      });
  }

  openUpdateItem(item: Item) {
    this.dialogService
      .open(
        CreateItemComponent,
        buildDialogOptions({
          data: item,
          header: 'Modifier un objet',
          width: '70%',
          height: '80%',
        })
      )
      .onClose.subscribe(updated => {
        if (updated) {
          this.items.reload();
        }
      });
  }

  deleteItem(item: Item) {
    this.dialogService
      .open(
        SimpleModalComponent,
        buildDialogOptions<SimpleModalData>({
          header: 'Supprimer ' + item.name,
          data: {
            message: `Êtes-vous sûr de vouloir supprimer l'objet "${item.name}" ?`,
            cancelText: 'Annuler',
            confirmText: 'Supprimer',
            confirm: true,
          },
        })
      )
      .onClose.subscribe(confirmed => {
        if (confirmed) {
          this.itemService.deleteItem(item).subscribe(() => {
            this.items.reload();
          });
        }
      });
  }
}
