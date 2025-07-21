import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  resource,
  signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { AppTable } from '@app/components/ui/table/table.component';
import { ItemsService } from '@app/core/services/items.service';
import { Item } from '@app/core/types/item.type';
import { DIALOG_RESPONSIVE_BREAKPOINTS } from '@app/core/utils/constants';
import { environment } from '@env/environment';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { ModalViewTakenItemsComponent } from './modal-view-taken-items/modal-view-taken-items.component';

@Component({
  selector: 'app-step2',
  imports: [
    Button,
    ReactiveFormsModule,
    AppTable,
    TableModule,
    Paginator,
    Select,
    FormsModule,
    Checkbox,
    SearchBarComponent,
  ],
  templateUrl: './step2.component.html',
  styleUrl: './step2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step2Component {
  private itemsService = inject(ItemsService);
  nextStep = output();
  previousStep = output();
  startDate = input.required<Date>();
  endDate = input.required<Date>();
  formGroup = input.required<FormControl<Item[]>>();

  options = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];
  baseUrl = environment.api_url + '/storage/';

  page = signal(1);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');
  sortBy = signal<1 | -1>(1);
  first = computed(() => this.page() * this.size());
  categoryId = signal<number | undefined>(undefined);

  categoriesResource = resource({
    loader: () => lastValueFrom(this.itemsService.getCategories()),
  });

  categories = computed(() => [
    { name: '-- Sélectionner une catégorie --', id: undefined },
    ...(this.categoriesResource.value() ?? []),
  ]);

  itemsResource = resource({
    loader: ({ params }) =>
      lastValueFrom(this.itemsService.getAvailableItems(params)),
    params: () => ({
      page: this.page(),
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: this.sortBy() === 1 ? 'asc' : 'desc',
      category_id: this.categoryId(),
      start_date: new Date(this.startDate()),
      end_date: new Date(this.endDate()),
    }),
  });

  items = computed(() => {
    return (this.itemsResource.value()?.data ?? []).map(item => ({
      ...item,
      selected: this.formGroup().value?.some(i => i.id === item.id) || false,
    }));
  });

  onPageChange(event: PaginatorState) {
    this.page.set(event.page!);
    this.size.set(event.rows!);
  }

  toggleProductSelection(product: Item) {
    const currentValues = this.formGroup().value || [];

    if (!currentValues.some(item => item.id === product.id)) {
      this.formGroup().setValue([...currentValues, product]);
    } else {
      this.formGroup().setValue(
        currentValues.filter((item: Item) => item.id !== product.id)
      );
    }
    console.log(this.formGroup().value);
  }

  private readonly dialogService = inject(DialogService);

  viewTakenItems() {
    this.dialogService.open(ModalViewTakenItemsComponent, {
      header: 'Objets pris',
      width: '70%',
      height: '80%',
      modal: true,
      dismissableMask: true,
      breakpoints: DIALOG_RESPONSIVE_BREAKPOINTS,
      inputValues: {
        items: this.formGroup().value || [],
      },
    });
  }

  onCategoryChange() {
    this.page.set(1); // Reset to the first page when category changes
  }
}
