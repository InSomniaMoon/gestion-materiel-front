import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
  Signal,
} from '@angular/core';
import { ItemsService } from '../../../core/services/items.service';
import { Item } from '../../../core/types/item.type';
import { PaginatedData } from '../../../core/types/paginatedData.type';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { ItemFragmentComponent } from './item-fragment/item-fragment.component';

import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-items-list',
    imports: [
        ItemFragmentComponent,
        SearchBarComponent,
        ProgressSpinnerModule,
        ButtonModule,
        RouterLink,
    ],
    styleUrl: './items-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <a
      pButton
      label="Ajouter un objet"
      icon="pi pi-plus"
      iconPos="right"
      routerLink="/admin/items/create"
    ></a>
    <app-search-bar (queryChange)="searchQuery.set($event)" />
    @if (itemsQuery.isLoading()) {
      <p-progressSpinner [style]="{ margin: 'auto' }" />
    }
    @if (itemsQuery.isFetched()) {
      @for (item of items(); track $index) {
        <app-item-fragment [item]="item" />
      }
    }
  `
})
export class ItemsListComponent implements OnDestroy {
  private readonly items$ = inject(ItemsService);
  readonly paginated!: Signal<PaginatedData<Item> | undefined>;

  searchQuery = signal('');

  itemsQuery = injectQuery(() => ({
    queryKey: ['searchItems', this.searchQuery()],
    queryFn: () => lastValueFrom(this.items$.getItems(this.searchQuery())),
  }));
  constructor() {
    this.paginated = toSignal(
      this.items$.getItems().pipe(takeUntilDestroyed()),
    );
  }

  items = computed(() => this.itemsQuery.data()?.data ?? []);

  ngOnDestroy() {}
}
