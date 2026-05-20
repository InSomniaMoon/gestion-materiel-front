import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '@app/components/simple-modal/simple-modal.component';
import { UploadFileComponent } from '@app/components/upload-file/upload-file.component';
import { AuthService } from '@app/core/services/auth.service';
import { buildDialogOptions } from '@app/core/utils/constants';
import { debounceTimeSignal } from '@app/core/utils/signals.utils';
import { Item } from '@core/types/item.type';
import { ItemsService } from '@services/items.service';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { lastValueFrom } from 'rxjs';
import { ItemsReloaderService } from '../items-reloader.service';
@Component({
  selector: 'app-create-update-item',
  imports: [
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
            [options]="categories.value()"
            optionLabel="name"
            optionValue="id"
            filterBy="name"
            scrollHeight="200px"
            formControlName="categoryId"
            [loading]="categories.isLoading()"
            [filter]="true"
            (onFilter)="categoryQuery.set($event.filter)" />
          <label for="category">Catégorie</label>
        </p-float-label>
        @if (selectedCategory()?.identified) {
          <p-float-label variant="on">
            <p-date-picker id="dateOfBuy" formControlName="dateOfBuy" />
            <label for="dateOfBuy">Date d'achat (optionnel)</label>
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
        <p-float-label variant="on" style="flex:1;">
          <textarea
            pTextarea
            id="description"
            fluid
            autoResize
            rows="6"
            formControlName="description"></textarea>
          <label for="description">Description (optionnel)</label>
        </p-float-label>
        <app-upload-file
          [handler]="fileUploadHandler"
          (fileUploaded)="setImagePath($event)" />
      </div>
    </form>
    <p-footer>
      @if (data) {
        <p-button
          icon="pi pi-trash"
          severity="danger"
          label="Supprimer"
          (onClick)="deleteItem()" />
      } @else {
        <div></div>
      }
      <button
        pButton
        [disabled]="!form.valid"
        type="submit"
        (click)="onSubmit()">
        {{ data ? 'Modifier' : 'Créer' }}
      </button>
    </p-footer>
  `,
  styleUrl: './create-update-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateItemComponent implements OnInit {
  private readonly itemService = inject(ItemsService);
  protected readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthService);
  private readonly reloadItemService = inject(ItemsReloaderService);
  private readonly messageService = inject(MessageService);

  protected data: Item | undefined = this.dialogService.getInstance(
    this.dialogRef
  )?.data;

  fileUploadHandler = this.itemService.uploadImage;

  setImagePath(filePAth: string) {
    this.form.patchValue({
      image: filePAth,
    });
  }

  readonly categoryQuery = signal('');

  private readonly debouncedCategoryQuery = debounceTimeSignal(
    this.categoryQuery,
    300
  );

  categories = resource({
    loader: ({ params }) =>
      lastValueFrom(this.itemService.getCategories(params.q)),
    params: () => ({
      q: this.debouncedCategoryQuery(),
    }),
    defaultValue: [],
  });

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
    categoryId: this.fb.nonNullable.control<number | undefined>(undefined, {
      validators: [Validators.required],
    }),

    dateOfBuy: this.fb.nonNullable.control<Date | undefined>(undefined, {
      validators: [],
    }),
    stock: this.fb.nonNullable.control(1, {
      validators: [Validators.min(1)],
    }),
  });

  categoryIdValue = toSignal(this.form.get('categoryId')!.valueChanges, {
    initialValue: this.form.value.categoryId,
  });
  selectedCategory = computed(() =>
    this.categories.value()?.find(cat => cat.id === this.categoryIdValue())
  );

  ngOnInit(): void {
    if (!this.data) {
      return;
    }
    this.form.patchValue({
      categoryId: this.categories.value()?.[0]?.id,
    });

    this.form.patchValue({
      name: this.data.name,
      description: this.data.description,
      categoryId: this.data.categoryId,
      dateOfBuy: this.data.dateOfBuy
        ? new Date(this.data.dateOfBuy)
        : undefined,
      stock: this.data.stock ?? 1,
    });
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

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      const item: Item = {
        id: this.data?.id ?? 0,
        usable: true,
        name: value.name,
        description: value.description,
        categoryId: value.categoryId!,
        dateOfBuy: value.dateOfBuy,
        structureId: this.authService.selectedStructure()?.id!,
        image: value.image,
        stock: value.stock,
      };
      (this.data
        ? this.itemService.updateItem(item)
        : this.itemService.createItem(item)
      ).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
      });
    }
  }

  deleteItem() {
    this.dialogService
      .open(
        SimpleModalComponent,
        buildDialogOptions<SimpleModalData>({
          header: 'Supprimer ' + this.data!.name,
          data: {
            message: `Êtes-vous sûr de vouloir supprimer l'objet "${this.data!.name}" ?`,
            cancelText: 'Annuler',
            confirmText: 'Supprimer',
            confirm: true,
            severity: 'danger',
          },
        })
      )!
      .onClose.subscribe(confirmed => {
        if (confirmed) {
          this.itemService.deleteItem(this.data!).subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: "L'objet a été supprimé avec succès.",
            });
            this.dialogRef.close(true);
            this.reloadItemService.reloadItem.next();
          });
        }
      });
  }
}
