import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { Item, ItemCategory } from '@core/types/item.type';
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
        (queryChange)="searchQuery.set($event); resetPagination()"
        style="flex: 1;" />

      <p-select
        [options]="categories()"
        (onChange)="categoryFilter.set($event.value); resetPagination()"
        dropdownIcon="pi pi-filter"
        [focusOnHover]="true" />
    </div>

    <div class="items-list" #scroll>
      @for (item of items(); track $index) {
        <app-item-fragment [item]="item" />
      }
      @if (itemsQuery.isLoading()) {
        <div
          class="flex justify-center content-center"
          style="grid-column: 1/-1; padding-block: 1rem;">
          <p-progress-spinner
            strokeWidth="8"
            fill="transparent"
            animationDuration=".5s"
            [style]="{ width: '50px', height: '50px' }" />
        </div>
      }
    </div>
  `,
})
export class ItemsListComponent implements OnDestroy, AfterViewInit {
  private readonly items$ = inject(ItemsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly scrollContent =
    viewChild.required<ElementRef<HTMLDivElement>>('scroll');

  searchQuery = signal('');

  page = signal(1);

  noMoreData = signal(false);

  categoryFilter = signal<number | undefined>(undefined);

  queryKey = computed(() => [
    'searchItems',
    this.page(),
    this.searchQuery(),
    this.categoryFilter(),
  ]);

  private readonly cats!: Signal<ItemCategory[]>;

  items = signal<Item[]>([]);

  categories = computed(() => [
    { label: 'Categories', value: null },
    ...this.cats().map(cat => ({
      label: this.upperCaseFirstLetter(cat.name),
      value: cat.id,
    })),
  ]);

  itemsQuery = injectQuery(() => ({
    queryKey: this.queryKey(),
    enabled: !this.noMoreData(),
    queryFn: () =>
      lastValueFrom(
        this.items$
          .getItems({
            page: this.page(),
            size: 25,
            q: this.searchQuery(),
            category_id: this.categoryFilter(),
          })
          .pipe(
            tap(data => {
              this.items.update(d => [...d, ...data.data]);
              if (data.last_page == data.current_page)
                this.noMoreData.set(true);
            })
          )
      ),
  }));

  private readonly authService = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  constructor() {
    this.cats = toSignal(
      this.items$.getCategories().pipe(takeUntilDestroyed(this.destroyRef)),
      {
        initialValue: [],
      }
    );
    effect(
      () => {
        console.log('selected group changed');

        this.authService.selectedGroup();

        this.resetPagination();
        this.queryClient.refetchQueries({ queryKey: ['searchItems'] });
      },
      { debugName: 'selectedGroupChanged' }
    );
  }

  ngAfterViewInit(): void {
    fromEvent(this.scrollContent().nativeElement!, 'scroll')
      .pipe(
        map(() => {
          return this.scrollContent().nativeElement.scrollTop;
        })
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(scrollPos => {
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

  resetPagination() {
    this.page.set(1);
    this.items.set([]);
    this.noMoreData.set(false);
  }

  onScroll(event: any) {
    console.log(event);

    // this.page.set($event + 1);
  }
}
