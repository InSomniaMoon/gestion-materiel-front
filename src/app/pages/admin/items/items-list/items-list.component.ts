import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '@app/core/services/items.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { AgroditTable } from '../../../../components/ui/table/table.component';

@Component({
  selector: 'app-items-list',
  imports: [TableModule, PaginatorModule, Select, FormsModule, AgroditTable],

  template: `
    <matos-table [status]="items.status()">
      <p-table [value]="items.value()?.data ?? []">
        <ng-template #header>
          <tr>
            <th>Nom</th>
            <th>Categorie</th>
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
        <span class="mx-1 text-color">Items per page: </span>
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
}
