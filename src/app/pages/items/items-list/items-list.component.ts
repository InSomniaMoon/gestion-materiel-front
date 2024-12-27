import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
  Signal,
} from '@angular/core';
import { Item } from '@core/types/item.type';
import { PaginatedData } from '@core/types/paginatedData.type';
import { ItemsService } from '@services/items.service';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { ItemFragmentComponent } from './item-fragment/item-fragment.component';

import { injectQuery } from '@tanstack/angular-query-experimental';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-items-list',
  imports: [
    ItemFragmentComponent,
    SearchBarComponent,
    ProgressSpinnerModule,
    ButtonModule,
    Select,
  ],
  styleUrl: './items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex">
      <app-search-bar
        (queryChange)="searchQuery.set($event)"
        style="flex: 1;"
      />

      <p-select
        [options]="categories()"
        (onChange)="categoryFilter.set($event.value)"
        dropdownIcon="pi pi-filter"
        [focusOnHover]="true"
      />
    </div>
    @if (itemsQuery.isLoading()) {
      <p-progressSpinner />
    }

    @if (itemsQuery.isFetched()) {
      <div class="items-list">
        @for (item of items(); track $index) {
          <app-item-fragment [item]="item" />
        }
      </div>
    }
  `,
})
export class ItemsListComponent implements OnDestroy {
  private readonly items$ = inject(ItemsService);
  readonly paginated!: Signal<PaginatedData<Item> | undefined>;

  searchQuery = signal('');

  categoryFilter = signal<string | undefined>(undefined);

  private readonly cats!: Signal<string[]>;

  categories = computed(() => [
    { label: 'Categories', value: null },
    ...this.cats().map((cat) => ({
      label: this.upperCaseFirstLetter(cat),
      value: cat,
    })),
  ]);

  itemsQuery = injectQuery(() => ({
    queryKey: ['searchItems', this.searchQuery(), this.categoryFilter()],
    queryFn: () =>
      lastValueFrom(
        this.items$.getItems({
          page: 1,
          size: 25,
          searchQuery: this.searchQuery(),
          category: this.categoryFilter(),
        }),
      ),
  }));

  constructor() {
    this.paginated = toSignal(
      this.items$.getItems().pipe(takeUntilDestroyed()),
    );

    this.cats = toSignal(
      this.items$.getCategories().pipe(takeUntilDestroyed()),
      {
        initialValue: [],
      },
    );
  }

  items = computed(() => this.itemsQuery.data()?.data ?? []);

  ngOnDestroy() {}

  private upperCaseFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
