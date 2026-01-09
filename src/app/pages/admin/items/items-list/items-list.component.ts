import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { PaginatorComponent } from '@app/components/ui/paginator/paginator.component';
import { AuthService } from '@app/core/services/auth.service';
import { CategoriesService } from '@app/core/services/categories.service';
import { TableLayoutService } from '@app/core/services/table-layout.service';
import { ItemDetailsComponent } from '@app/pages/items/item-details/item-details.component';
import { AppTable } from '@components/ui/table/table.component';
import { Item } from '@core/types/item.type';
import { environment } from '@env/environment';
import { ItemsService } from '@services/items.service';
import { buildDialogOptions } from '@utils/constants';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DataView } from 'primeng/dataview';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { fromEvent, lastValueFrom, map } from 'rxjs';
import { CreateUpdateItemComponent } from './create-update-item/create-update-item.component';
import { ItemsReloaderService } from './items-reloader.service';
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
    PaginatorComponent,
    DataView,
    FormsModule,
    Badge,
    SelectButton,
    Card,
  ],
  providers: [ItemsReloaderService],
  template: `
    <div class="header">
      <div class="flex wrap">
        @if (!isMobile()) {
          <h1>Objets</h1>
        }
        <div class="flex">
          <p-select
            [options]="categories()"
            optionLabel="label"
            optionValue="code"
            fluid
            placeholder="Catégorie"
            [style]="{ width: isMobile() ? '50%' : '200px' }"
            [ngModel]="selectedCategory()"
            (ngModelChange)="selectedCategory.set($event)" />
          <app-search-bar (queryChange)="searchQuery.set($event)" />
        </div>

        @if (layout() == 'grid') {
          <p-select
            [options]="sortOptions"
            [ngModel]="orderBy()"
            dropdownIcon="pi pi-sort" />

          <p-button
            outlined
            [icon]="'pi pi-sort-alpha-down' + (sortBy() === 1 ? '' : '-alt')"
            (onClick)="switchSortOrder()" />
        }
      </div>
    </div>

    <matos-table [status]="items.status()">
      <p-data-view [value]="items.value()?.data ?? []" [layout]="layout()">
        <ng-template #header>
          <div class="flex space-between">
            @if (isAdmin()) {
              <p-button
                icon="pi pi-plus"
                label="Ajouter"
                (onClick)="openCreateItem()" />
            } @else {
              <div></div>
            }
            <p-select-button
              [ngModel]="layout()"
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
            [value]="items ?? []"
            stripedRows
            [sortField]="orderBy()"
            [sortOrder]="sortBy()"
            (onSort)="orderBy.set($event.field); sortBy.set($event.order)">
            <ng-template #header>
              <tr>
                <th pSortableColumn="state">
                  Etat<p-sortIcon field="state" />
                </th>
                <th></th>
                <th pSortableColumn="name">Nom<p-sortIcon field="name" /></th>
                <th pSortableColumn="category_id">
                  Categorie <p-sortIcon field="category_id" />
                </th>
                <th pSortableColumn="open_issues_count">
                  Problèmes
                  <p-sortIcon field="open_issues_count" />
                </th>
                <th>Stock</th>
              </tr>
            </ng-template>
            <ng-template #body let-item>
              <tr
                (click)="isAdmin() ? openItemUpdate(item) : openItemView(item)">
                <td class="image">
                  <p-badge
                    size="small"
                    value=" "
                    [severity]="
                      item.state === 'OK'
                        ? 'success'
                        : item.state === 'NOK'
                          ? 'warn'
                          : item.state === 'KO'
                            ? 'danger'
                            : 'info'
                    " />
                </td>
                <td class="image">
                  @if (item.image) {
                    <img [src]="baseUrl + item.image" alt="" />
                  }
                </td>
                <td>{{ item.name }}</td>
                <td style="text-wrap: nowrap;">{{ item.category.name }}</td>
                <td style="text-wrap: nowrap;text-align: center;">
                  {{ item.open_issues_count }}
                </td>
                <td>{{ item.stock }}</td>
              </tr>
            </ng-template>
          </p-table>

          <!-- @for (item of items; track $index) {
            <app-list-item
              (click)="isAdmin() ? openItemUpdate(item) : openItemView(item)"
              [item]="item" />
            @if (!$last) {
              <hr style="margin: 0 1rem;" />
            }
          } -->
        </ng-template>
        <ng-template #grid let-items>
          <div class="grid">
            @for (item of items; track $index) {
              <p-card
                (click)="isAdmin() ? openItemUpdate(item) : openItemView(item)">
                <div class="flex">
                  <p-badge
                    size="small"
                    value=" "
                    [severity]="
                      item.state === 'OK'
                        ? 'success'
                        : item.state === 'NOK'
                          ? 'warn'
                          : item.state === 'KO'
                            ? 'danger'
                            : 'info'
                    " />
                  @if (item.image) {
                    <img
                      [src]="imageBaseUrl + item.image"
                      alt="{{ item.name }}"
                      class="item-image" />
                  }
                  <div class="item-details">
                    <span class="item-category">
                      {{ item.category?.name }}
                    </span>
                    <span class="item-name">
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </p-card>
            }
          </div>
        </ng-template>
      </p-data-view>

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
export class ItemsListComponent implements OnInit {
  private readonly itemService = inject(ItemsService);
  private readonly dialogService = inject(DialogService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly authService = inject(AuthService);
  private readonly tableLayoutService = inject(TableLayoutService);
  readonly imageBaseUrl = `${environment.api_url}/storage`;

  readonly sortOptions = [{ label: 'Catégorie', value: 'category_id' }];

  switchSortOrder() {
    this.sortBy.set(this.sortBy() === 1 ? -1 : 1);
  }
  categories = toSignal(
    this.categoriesService
      .getCategories({
        size: 50,
        order_by: 'name',
        sort_by: 'asc',
        page: 1,
        q: '',
      })
      .pipe(
        map(categories => [
          { label: 'Toutes les catégories', code: undefined },
          ...categories.data.map(cat => ({ label: cat.name, code: cat.id })),
        ])
      ),
    { initialValue: [] }
  );

  dataViewType = [
    { label: 'Liste', value: 'list' },
    { label: 'Tableau', value: 'grid' },
  ];
  layout = this.tableLayoutService.layout;
  setLayout(layout: 'list' | 'grid') {
    this.tableLayoutService.setLayout(layout);
  }

  selectedCategory = signal<number | undefined>(undefined);

  isAdmin = toSignal(
    inject(ActivatedRoute).data.pipe(map(data => data['isAdmin'] || false)),
    { initialValue: false }
  );
  private windowSize = toSignal(
    fromEvent(window, 'resize').pipe(
      map((event: Event) => (event.target as Window).innerWidth)
    ),
    { initialValue: window.innerWidth }
  );

  isMobile = computed(() => this.windowSize() < 768);

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

  selectedStructure = computed(() => this.authService.selectedStructure()?.id);

  page = signal(0);
  size = signal(100);
  searchQuery = signal('');
  orderBy = signal('category_id');
  sortBy = signal<1 | -1>(1);
  first = computed(() => this.page() * this.size());

  items = resource({
    loader: ({ params }) => {
      return lastValueFrom(
        this.itemService.getAdminItems({
          page: params.page + 1,
          category_id: params.selected_category,
          order_by: params.order_by,
          sort_by: params.sort_by,
          size: params.size,
          q: params.q,
          selected_category: params.selected_category,
        })
      );
    },
    params: () => ({
      page: this.page(),
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: this.sortBy() === 1 ? 'asc' : 'desc',
      selected_category: this.selectedCategory(),
      structure_id: this.selectedStructure(),
    }),
  });

  private readonly reoladItemService = inject(ItemsReloaderService);

  ngOnInit(): void {
    this.reoladItemService.reloadItem.subscribe(() => {
      this.items.reload();
    });
  }

  openCreateItem() {
    this.dialogService
      .open(
        CreateUpdateItemComponent,
        buildDialogOptions({
          header: 'Créer un objet',
          width: '70%',
          height: '80%',
        })
      )!
      .onClose.subscribe(created => {
        if (created) {
          this.items.reload();
        }
      });
  }

  openUpdateItem(item: Item) {
    this.dialogService
      .open(
        CreateUpdateItemComponent,
        buildDialogOptions({
          data: item,
          header: 'Modifier un objet',
          width: '70%',
          height: '80%',
        })
      )!
      .onClose.subscribe(updated => {
        if (updated) {
          this.items.reload();
        }
      });
  }

  openItemUpdate(item: Item) {
    this.openUpdateItem(item);
  }

  openItemView(item: Item) {
    this.dialogService.open(
      ItemDetailsComponent,
      buildDialogOptions({
        inputValues: {
          itemId: item.id,
        },
      })
    );
  }
}
