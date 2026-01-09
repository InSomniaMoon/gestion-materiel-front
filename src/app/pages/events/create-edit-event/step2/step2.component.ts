import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  OnInit,
  output,
  resource,
  runInInjectionContext,
  Signal,
  signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { toSignal } from '@angular/core/rxjs-interop';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { PaginatorComponent } from '@app/components/ui/paginator/paginator.component';
import { AppTable } from '@app/components/ui/table/table.component';
import { Event } from '@app/core/types/event.type';
import { SortBy } from '@app/core/types/pagination-request.type';
import { ItemWithQuantity } from '@core/types/item.type';
import { environment } from '@env/environment';
import { ItemsService } from '@services/items.service';
import { buildDialogOptions } from '@utils/constants';
import {
  Button,
  ButtonDirective,
  ButtonIcon,
  ButtonLabel,
} from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { ItemSelection } from '../create-edit-event.component';
import { ModalViewTakenItemsComponent } from './modal-view-taken-items/modal-view-taken-items.component';
import { SelectQuantityItemsComponent } from './select-quantity-items/select-quantity-items.component';

@Component({
  selector: 'app-step2',
  imports: [
    ButtonDirective,
    ReactiveFormsModule,
    AppTable,
    TableModule,
    Select,
    FormsModule,
    Checkbox,
    SearchBarComponent,
    PaginatorComponent,
    Button,
    ButtonDirective,
    ButtonLabel,
    ButtonIcon,
  ],
  templateUrl: './step2.component.html',
  styleUrl: './step2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step2Component implements OnInit {
  private readonly itemsService = inject(ItemsService);
  private readonly injectionContext = inject(Injector);
  nextStep = output();
  previousStep = output();
  startDate = input.required<Date>();
  endDate = input.required<Date>();

  formGroup = input.required<FormControl<ItemSelection[]>>();

  event = input<Event | null>(null);

  baseUrl = environment.api_url + '/storage/';

  options = [
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '250', value: 250 },
  ];
  page = signal(0);
  size = signal(100);
  searchQuery = signal('');
  orderBy = signal('items.name');
  sortBy = signal<1 | -1>(1);
  categoryId = signal<number | undefined>(undefined);
  selectedItems!: Signal<ItemSelection[]>;
  selectedItemsCount = computed(() => this.selectedItems().length);

  categoriesResource = resource({
    loader: () => lastValueFrom(this.itemsService.getCategories()),
  });

  categories = computed(() => [
    { name: '-- Catégorie --', id: undefined },
    ...(this.categoriesResource.value() ?? []),
  ]);

  ngOnInit() {
    runInInjectionContext(this.injectionContext, () => {
      this.selectedItems = toSignal(this.formGroup().valueChanges, {
        initialValue: this.formGroup().value || [],
      });
    });
  }
  itemsResource = resource({
    loader: ({ params }) =>
      lastValueFrom(
        this.itemsService.getAvailableItems(params, this.event()?.id)
      ),
    params: () => ({
      page: this.page() + 1,
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: (this.sortBy() === 1 ? 'asc' : 'desc') as SortBy,
      category_id: this.categoryId(),
      start_date: new Date(this.startDate()),
      end_date: new Date(this.endDate()),
    }),
  });

  items = computed(() => {
    return (this.itemsResource.value()?.data ?? []).map(item => ({
      ...item,
      selected: this.selectedItems().some(i => i.item.id === item.id) || false,
    }));
  });

  selectUnselectItem(item: ItemWithQuantity) {
    if (item.category?.identified) {
      this.toggleProductSelection(item);
      return;
    }

    if (this.selectedItems().some(i => item.id === i.item.id)) {
      this.formGroup().setValue(
        this.selectedItems().filter((i: ItemSelection) => i.item.id !== item.id)
      );
      return;
    }
    this.openSelectQuantityDialog(item);
  }

  private toggleProductSelection(product: ItemWithQuantity, quantity?: number) {
    if (this.selectedItems().some(item => item.item.id === product.id)) {
      this.formGroup().setValue(
        this.selectedItems().filter(
          (item: ItemSelection) => item.item.id !== product.id
        )
      );
    } else {
      // open the dialog to select quantity and state
      this.formGroup().setValue([
        ...this.selectedItems(),
        { item: product, quantity: quantity ?? 1 },
      ]);
      // mark for check to update the table selection state
      this.formGroup().markAsDirty();
    }
  }

  private readonly dialogService = inject(DialogService);

  viewTakenItems() {
    this.dialogService.open(
      ModalViewTakenItemsComponent,
      buildDialogOptions({
        header: 'Objets pris',
        width: '70%',
        height: '80%',
        inputValues: {
          items: this.formGroup().value || [],
        },
      })
    );
  }

  onCategoryChange() {
    this.page.set(1); // Reset to the first page when category changes
  }

  openSelectQuantityDialog(item: ItemWithQuantity) {
    this.dialogService
      .open(
        SelectQuantityItemsComponent,
        buildDialogOptions({
          header: 'Sélectionner la quantité',
          width: '50%',
          inputValues: {
            item,
          },
        })
      )!
      .onClose.subscribe((result: number | null) => {
        if (result !== null && result > 0) {
          this.toggleProductSelection(item, result);
        }
      });
  }
}
