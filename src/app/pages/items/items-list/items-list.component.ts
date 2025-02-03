import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { Item } from '@core/types/item.type';
import { PaginatedData } from '@core/types/paginatedData.type';
import { ItemsService } from '@services/items.service';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { ItemFragmentComponent } from './item-fragment/item-fragment.component';

import { AuthService } from '@app/core/services/auth.service';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { fromEvent, lastValueFrom, map, tap } from 'rxjs';

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

    <div class="items-list" #scroll>
      @for (item of items(); track $index) {
        <app-item-fragment [item]="item" />
      }
      @if (itemsQuery.isLoading()) {
        <p-progressSpinner />
      }
    </div>
  `,
})
export class ItemsListComponent implements OnDestroy, AfterViewInit {
  private readonly items$ = inject(ItemsService);
  readonly paginated!: Signal<PaginatedData<Item> | undefined>;

  private readonly scrollContent =
    viewChild.required<ElementRef<HTMLDivElement>>('scroll');

  searchQuery = signal('');

  page = signal(1);

  noMoreData = signal(false);

  categoryFilter = signal<string | undefined>(undefined);

  queryKey = [
    'searchItems',
    this.page(),
    this.searchQuery(),
    this.categoryFilter(),
  ];

  private readonly cats!: Signal<string[]>;

  items = signal<Item[]>([]);

  categories = computed(() => [
    { label: 'Categories', value: null },
    ...this.cats().map((cat) => ({
      label: this.upperCaseFirstLetter(cat),
      value: cat,
    })),
  ]);

  itemsQuery = injectQuery(() => ({
    queryKey: this.queryKey,
    enabled: !this.noMoreData(),
    queryFn: () =>
      lastValueFrom(
        this.items$
          .getItems({
            page: this.page(),
            size: 10,
            searchQuery: this.searchQuery(),
            category: this.categoryFilter(),
          })
          .pipe(
            tap((data) => {
              this.items.update((d) => [...d, ...data.data]);
              if (data.last_page == data.current_page)
                this.noMoreData.set(true);
            }),
          ),
      ),
  }));

  private readonly authService = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  constructor() {
    this.cats = toSignal(
      this.items$.getCategories().pipe(takeUntilDestroyed()),
      {
        initialValue: [],
      },
    );
    effect(() => {
      console.log('selected group changed');

      this.authService.selectedGroup();
      this.queryClient.invalidateQueries({ queryKey: this.queryKey });
    });
  }

  ngAfterViewInit(): void {
    fromEvent(this.scrollContent().nativeElement!, 'scroll')
      .pipe(
        map(() => {
          return this.scrollContent().nativeElement.scrollTop;
        }),
      )
      .subscribe((scrollPos) => {
        let limit =
          this.scrollContent().nativeElement.scrollHeight -
          this.scrollContent().nativeElement.clientHeight;
        if (scrollPos > limit - 20) {
          if (this.itemsQuery.isLoading()) return;
          if (this.noMoreData()) return;
          this.page.set(this.page() + 1);
        }
      });
  }
  ngOnDestroy() {}

  private upperCaseFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onScroll(event: any) {
    console.log(event);

    // this.page.set($event + 1);
  }
}
