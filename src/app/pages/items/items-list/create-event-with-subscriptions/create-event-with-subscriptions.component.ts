import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { ItemsService } from '@app/core/services/items.service';
import { Item } from '@app/core/types/item.type';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { Unit } from '@app/core/types/unit.type';
import { debounceTimeSignal } from '@app/core/utils/signals.utils';
import {
  MessageService,
  ResponsiveOverlayOptions,
  ScrollerOptions,
} from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { lastValueFrom, of, tap } from 'rxjs';

@Component({
  selector: 'app-create-event-with-subscriptions',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    FloatLabel,
    DatePicker,
    Button,
    InputText,
    Select,
  ],
  templateUrl: './create-event-with-subscriptions.component.html',
  styleUrl: './create-event-with-subscriptions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEventWithSubscriptionsComponent implements OnInit {
  private readonly dialogRef = inject(DialogService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ref = inject(DynamicDialogRef);
  private readonly toast = inject(MessageService);
  private readonly itemsService = inject(ItemsService);

  readonly units = this.authService.userUnits;

  minDate = signal(new Date());
  responsiveOptions: ResponsiveOverlayOptions[] = [
    {
      breakpoint: '768px',
    },
  ];

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.minDate.set(this.date(value.start_date!));
      });

    effect(() => {
      this.itemsSearchQueryDebounced();
      this.availableItemsPage.set(1);
      this.availableItems.set([]);
    });

    effect(() => {
      console.log(this.groupedAvailableItems());
    });
  }

  ngOnInit(): void {
    let curDate = new Date();
    curDate.setMinutes(0, 0, 0);
    // format :2024-11-13 16:01

    this.form.patchValue({
      start_date: this.formatDate(curDate),
      end_date: this.formatDate(curDate),
      unit: this.units()[0] ?? null,
    });
  }
  form = this.fb.group(
    {
      name: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      start_date: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      end_date: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      unit: this.fb.control<Unit | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      items: this.fb.control<Item[]>([]),
    },
    {
      validators: [
        form => {
          if (form.get('start_date')?.value > form.get('end_date')?.value) {
            return { invalidDate: true };
          }
          if (form.get('start_date')?.value === form.get('end_date')?.value) {
            return { invalidDate: true };
          }
          return null;
        },
      ],
    }
  );

  get items() {
    return this.form.get('items')! as FormControl<Item[]>;
  }

  private categories = toSignal(this.itemsService.getCategories(), {
    initialValue: [],
  });

  private readonly startDate = toSignal(
    this.form.get('start_date')!.valueChanges,
    { initialValue: '' }
  );
  private readonly endDate = toSignal(this.form.get('end_date')!.valueChanges, {
    initialValue: '',
  });
  private availableItems = signal<Item[]>([]);
  protected groupedAvailableItems = computed(() =>
    Object.entries(
      Object.groupBy(this.availableItems(), (item: Item) => item.category_id)
    ).map(([categoryId, items]) => ({
      label:
        this.categories().find(cat => cat.id === Number(categoryId))?.name ||
        'Autres',
      value: categoryId,
      items: items,
    }))
  );

  scrollOption = computed<ScrollerOptions>(() => ({
    lazy: true,
    items: this.groupedAvailableItems(),
    itemSize: 50,
  }));

  itemsSearchQuery = signal('');
  private itemsSearchQueryDebounced = debounceTimeSignal(this.itemsSearchQuery);
  protected availableItemsPage = signal(1);
  availableItemsResource = resource<PaginatedData<Item>, any>({
    params: () => ({
      endDate: this.endDate(),
      startDate: this.startDate(),
      q: this.itemsSearchQueryDebounced(),
      page: this.availableItemsPage(),
    }),

    loader: ({ params }) =>
      params.startDate != params.endDate
        ? lastValueFrom(
            this.itemsService
              .getAvailableItems({
                start_date: new Date(params.startDate),
                end_date: new Date(params.endDate),
                page: params.page,
                size: 25,
                q: params.q,
              })
              .pipe(
                tap(data => {
                  this.availableItems.update(val => [...val, ...data.data]);
                })
              )
          )
        : lastValueFrom(
            of({
              data: [],
              total: 0,
              per_page: 25,
              current_page: 1,
              last_page: 1,
              to: 0,
              from: 0,
            } as PaginatedData<Item>)
          ),
    defaultValue: {
      data: [],
      total: 0,
      per_page: 25,
      current_page: 1,
      last_page: 1,
      to: 0,
      from: 0,
    },
  });

  close() {
    this.ref.close();
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.value;
  }

  resetEndDate() {
    this.form.patchValue({
      end_date: this.form.get('start_date')?.value,
    });
  }

  addItem(item: Item) {
    if (this.items.value.find(i => i.id === item.id)) {
      this.toast.add({
        severity: 'warn',
        summary: 'Item déjà ajouté',
        detail: 'Cet item est déjà dans la liste.',
      });
      return;
    }

    this.items.patchValue([...this.items.value, item]);
    this.availableItems.update(val => val.filter(i => i.id !== item.id));
  }
  removeItem(item: Item) {
    this.items.patchValue(this.items.value.filter(i => i.id !== item.id));
  }

  log(loggable: any) {
    console.log(loggable);
  }

  private date(str: string): Date {
    return new Date(str);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
