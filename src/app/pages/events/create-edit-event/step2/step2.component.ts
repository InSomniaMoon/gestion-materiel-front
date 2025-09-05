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
import { PaginatorComponent } from '@app/components/ui/paginator/paginator.component';
import { AppTable } from '@app/components/ui/table/table.component';
import { Event } from '@app/core/types/event.type';
import { Item } from '@core/types/item.type';
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
import { ModalViewTakenItemsComponent } from './modal-view-taken-items/modal-view-taken-items.component';

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
export class Step2Component {
  private itemsService = inject(ItemsService);
  nextStep = output();
  previousStep = output();
  startDate = input.required<Date>();
  endDate = input.required<Date>();
  formGroup = input.required<FormControl<Item[]>>();

  event = input<Event | null>(null);

  baseUrl = environment.api_url + '/storage/';

  page = signal(0);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');
  sortBy = signal<1 | -1>(1);
  categoryId = signal<number | undefined>(undefined);

  categoriesResource = resource({
    loader: () => lastValueFrom(this.itemsService.getCategories()),
  });

  categories = computed(() => [
    { name: '-- Catégorie --', id: undefined },
    ...(this.categoriesResource.value() ?? []),
  ]);

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

  toggleProductSelection(product: Item) {
    const currentValues = this.formGroup().value || [];

    if (!currentValues.some(item => item.id === product.id)) {
      this.formGroup().setValue([...currentValues, product]);
    } else {
      this.formGroup().setValue(
        currentValues.filter((item: Item) => item.id !== product.id)
      );
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
}
