import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  Signal,
} from '@angular/core';
import { ItemsService } from '../../../core/services/items.service';
import { Item } from '../../../core/types/item.type';
import { PaginatedData } from '../../../core/types/paginatedData.type';

import { JsonPipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ItemFragmentComponent } from './item-fragment/item-fragment.component';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [ItemFragmentComponent, JsonPipe],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListComponent implements OnDestroy {
  private readonly items$ = inject(ItemsService);
  readonly paginated!: Signal<PaginatedData<Item> | undefined>;
  constructor() {
    this.paginated = toSignal(
      this.items$.getItems().pipe(takeUntilDestroyed())
    );
  }

  items = computed(() => this.paginated()?.data ?? []);

  ngOnDestroy() {}
}
