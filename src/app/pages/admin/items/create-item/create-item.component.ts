import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ItemsService } from '@app/core/services/items.service';
import { Item, ItemCategory } from '@app/core/types/item.type';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-create-item',
  imports: [
    CommonModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    Textarea,
    Select,
  ],
  template: `
    <h1>Créer un item</h1>
    <form [formGroup]="form">
      <p-floatLabel variant="on">
        <input pInputText type="text" id="name" formControlName="name" />
        <label for="name">Nom</label>
      </p-floatLabel>
      <p-floatLabel variant="on">
        <textarea
          pTextarea
          id="description"
          autoResize
          formControlName="description"
          rows="5"
        ></textarea>

        <label for="description">Description</label>
      </p-floatLabel>
      <p-floatLabel variant="on">
        <p-select [options]="categories()" formControlName="category" />
        <label for="category">Catégorie</label>
      </p-floatLabel>
      <div formArray="options">
        @for (item of options.controls; track $index) {
        <h3 class="option-title">Option {{ $index + 1 }}</h3>
        <div [formGroup]="item" class="option">
          <div class="option-form">
            <p-floatLabel variant="on">
              <input
                pInputText
                type="text"
                id="option-name-{{ $index }}"
                formControlName="name"
              />
              <label for="option-name-{{ $index }}">Nom</label>
            </p-floatLabel>
            <p-floatLabel variant="on">
              <textarea
                pInputTextarea
                id="option-description-{{ $index }}"
                autoResize
                formControlName="description"
                rows="5"
              ></textarea>
              <label for="option-description-{{ $index }}">Description</label>
            </p-floatLabel>
          </div>
          <p-button
            type="button"
            (click)="removeOption($index)"
            icon="pi pi-trash"
            severity="danger"
            outlined
          />
        </div>
        @if ($last) {
        <p-button label="Option" icon="pi pi-plus" (onClick)="addOption()" />
        } }
      </div>

      <button
        pButton
        [disabled]="!form.valid"
        type="submit"
        (click)="onSubmit()"
      >
        Créer
      </button>
    </form>
  `,
  styleUrl: './create-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateItemComponent implements OnInit {
  private readonly itemService = inject(ItemsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  categoryQuery = signal('');
  categories = signal<ItemCategory[]>([]);

  fb = inject(FormBuilder);
  form = this.fb.group({
    name: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    category: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    options: this.fb.array([this.newOption()]),
  });

  get options() {
    return this.form.controls['options'];
  }
  ngOnInit(): void {
    this.itemService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => this.categories.set(categories));
  }

  newOption() {
    return this.fb.group({
      name: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: this.fb.control('', {
        nonNullable: true,
      }),
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
        ...this.form.getRawValue(),
        id: 0,
        usable: true,
      };
      this.itemService.createItem(item).subscribe({
        next: () => {
          this.router.navigate(['/admin', 'items']);
        },
      });
    }
  }

  log(laggabel: any) {
    console.log(laggabel);
  }
}
