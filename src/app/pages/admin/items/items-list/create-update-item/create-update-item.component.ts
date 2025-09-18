import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UploadFileComponent } from '@app/components/upload-file/upload-file.component';
import { AuthService } from '@app/core/services/auth.service';
import { Item } from '@core/types/item.type';
import { ItemsService } from '@services/items.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { tap } from 'rxjs';
@Component({
  selector: 'app-create-update-item',
  imports: [
    CommonModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    Textarea,
    Select,
    DatePicker,
    UploadFileComponent,
  ],
  template: `
    <form [formGroup]="form">
      <div class="flex">
        <p-float-label variant="on">
          <input pInputText type="text" id="name" formControlName="name" />
          <label for="name">Nom</label>
        </p-float-label>
        <p-float-label variant="on">
          <p-select
            id="category"
            placeholder="Catégorie"
            [options]="categories()"
            optionLabel="name"
            optionValue="id"
            filterBy="name"
            scrollHeight="200px"
            formControlName="category_id"
            filter />
          <label for="category">Catégorie</label>
        </p-float-label>
        @if (selectedCategory()?.identified) {
          <p-float-label variant="on">
            <p-date-picker id="date_of_buy" formControlName="date_of_buy" />
            <label for="date_of_buy">Date d'achat (optionnel)</label>
          </p-float-label>
        } @else {
          <p-float-label variant="on">
            <input
              type="number"
              pInputText
              id="stock"
              formControlName="stock" />
            <label for="stock">Stock</label>
          </p-float-label>
        }
      </div>
      <div class="flex">
        <p-float-label variant="on" [class]="'w-full'" style="width: 100%;">
          <textarea
            pTextarea
            id="description"
            autoResize
            formControlName="description"
            rows="5"></textarea>

          <label for="description">Description (optionnel)</label>
        </p-float-label>
        <app-upload-file
          [handler]="fileUploadHandler"
          (fileUploaded)="setImagePath($event)" />
      </div>
      <div formArray="options">
        @for (item of options.controls; track $index) {
          <h3 class="option-title">Option {{ $index + 1 }}</h3>
          <div [formGroup]="item" class="option">
            <div class="option-form">
              <p-float-label variant="on">
                <input
                  pInputText
                  type="text"
                  id="option-name-{{ $index }}"
                  formControlName="name" />
                <label for="option-name-{{ $index }}">Nom</label>
              </p-float-label>
              <p-float-label variant="on">
                <textarea
                  pInputTextarea
                  id="option-description-{{ $index }}"
                  autoResize
                  formControlName="description"
                  rows="5"></textarea>
                <label for="option-description-{{ $index }}"
                  >Description (optionnel)</label
                >
              </p-float-label>
            </div>
            <p-button
              type="button"
              (click)="removeOption($index)"
              icon="pi pi-trash"
              severity="danger"
              outlined />
          </div>
        }
        <p-button label="Option" icon="pi pi-plus" (onClick)="addOption()" />
      </div>

      <button
        pButton
        [disabled]="!form.valid"
        type="submit"
        (click)="onSubmit()">
        {{ data ? 'Modifier' : 'Créer' }}
      </button>
    </form>
  `,
  styleUrl: './create-update-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateItemComponent implements OnInit {
  private readonly itemService = inject(ItemsService);
  protected readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthService);

  protected data: Item | undefined = this.dialogService.getInstance(
    this.dialogRef
  ).data;

  fileUploadHandler = this.itemService.uploadImage;

  setImagePath(filePAth: string) {
    this.form.patchValue({
      image: filePAth,
    });
  }

  categoryQuery = signal('');
  categories = toSignal(
    this.itemService.getCategories().pipe(
      tap(c => {
        if (!this.data) {
          this.form.patchValue({
            category_id: c[0]?.id,
          });
        }
      })
    ),
    {
      initialValue: [],
    }
  );

  fb = inject(FormBuilder);

  form = this.fb.group({
    name: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    image: this.fb.control<string>('', {
      nonNullable: true,
    }),
    description: this.fb.nonNullable.control(''),
    category_id: this.fb.nonNullable.control<number | undefined>(undefined, {
      validators: [Validators.required],
    }),
    options: this.fb.nonNullable.array([this.newOption()]),
    date_of_buy: this.fb.nonNullable.control<Date | undefined>(undefined, {
      validators: [],
    }),
    stock: this.fb.nonNullable.control(1, {
      validators: [Validators.min(1)],
    }),
  });

  categoryIdValue = toSignal(this.form.get('category_id')!.valueChanges, {
    initialValue: this.form.value.category_id,
  });
  selectedCategory = computed(() =>
    this.categories().find(cat => cat.id === this.categoryIdValue())
  );
  get options() {
    return this.form.controls['options'];
  }

  ngOnInit(): void {
    if (!this.data) {
      return;
    }
    console.log(this.data);

    this.form.patchValue({
      name: this.data.name,
      description: this.data.description,
      category_id: this.data.category_id,
      date_of_buy: this.data.date_of_buy
        ? new Date(this.data.date_of_buy)
        : undefined,
      stock: this.data.stock ?? 1,
    });
    this.options.clear();
    this.data.options?.forEach(option =>
      this.options.push(
        this.fb.group({
          id: this.fb.control(option.id ?? null),
          name: this.fb.control(option.name, {
            nonNullable: true,
            validators: [Validators.required],
          }),
          description: this.fb.control(option.description ?? '', {
            nonNullable: true,
          }),
          item_id: this.fb.control(option.item_id ?? null),
        })
      )
    );
  }

  newOption() {
    return this.fb.group({
      id: this.fb.control<number | null>(null),
      name: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: this.fb.control('', {
        nonNullable: true,
      }),
      item_id: this.fb.control<number | null>(this.data?.id ?? null),
    });
  }

  addOption() {
    const options = this.form.get('options') as FormArray;
    options.push(this.newOption());
  }

  removeOption(index: number) {
    const options = this.form.get('options') as FormArray;
    options.removeAt(index);
  }

  onSubmit() {
    if (this.form.valid) {
      const item: Item = {
        id: 0,
        usable: true,
        name: this.form.value.name!,
        description: this.form.value.description,
        category_id: this.form.value.category_id!,
        date_of_buy: this.form.value.date_of_buy,
        structure_id: this.authService.selectedStructure()?.id!,
        image: this.form.value.image,
        options: this.form.getRawValue().options.map(option => ({
          id: option.id ?? null,
          name: option.name,
          description: option.description,
          usable: true,
          item_id: this.data ? this.data.id : null,
        })),
      };
      (this.data
        ? this.itemService.updateItem({ ...item, id: this.data.id })
        : this.itemService.createItem(item)
      ).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
      });
    }
  }
}
