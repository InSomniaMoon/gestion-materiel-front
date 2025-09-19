import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { Button } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { fromEvent, lastValueFrom, map } from 'rxjs';
import { CreateUpdateItemComponent } from './create-update-item/create-update-item.component';
import { ListItemComponent } from './list-item/list-item.component';
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
    ListItemComponent,
    RouterLink,
  ],
  template: `
    <div class="header">
      <div class="flex">
        <h1>Objets</h1>
        <app-search-bar (queryChange)="searchQuery.set($event)" />
      </div>
      @if (isAdmin()) {
        <p-button
          icon="pi pi-plus"
          label="Ajouter"
          (onClick)="openCreateItem()" />
      }
    </div>

    <matos-table [status]="items.status()">
      <p-data-view [value]="items.value()?.data ?? []" layout="list">
        <ng-template #list let-items>
          @for (item of items; track $index) {
            <app-list-item
              (click)="isAdmin() ? openItemUpdate(item) : openItemView(item)"
              [item]="item" />
            @if (!$last) {
              <hr style="margin: 0 1rem;" />
            }
          }
        </ng-template>
        <ng-template #grid let-items>
          <div class="grid">
            @for (item of items; track $index) {
              <a routerLink="/items/{{ item.id }}">
                <app-list-item [item]="item" />
              </a>
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
export class ItemsListComponent {
  private readonly itemService = inject(ItemsService);
  private readonly dialogService = inject(DialogService);
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

  page = signal(0);
  size = signal(100);
  searchQuery = signal('');
  orderBy = signal('category_id');
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
        CreateUpdateItemComponent,
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
        CreateUpdateItemComponent,
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

  private readonly router = inject(Router);
  openItemUpdate(item: Item) {
    this.openUpdateItem(item);
  }

  openItemView(item: Item) {
    this.router.navigate(['/items', item.id]);
  }
}
