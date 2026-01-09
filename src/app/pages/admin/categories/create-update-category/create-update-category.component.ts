import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '@app/components/simple-modal/simple-modal.component';
import { ItemCategory } from '@app/core/types/item.type';
import { buildDialogOptions } from '@app/core/utils/constants';
import { CategoriesService } from '@services/categories.service';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-create-update-category',
  imports: [
    AccordionModule,
    Button,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    ToggleSwitch,
  ],
  templateUrl: './create-update-category.component.html',
  styleUrl: './create-update-category.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateCategoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  readonly ref = inject(DynamicDialogRef);
  private readonly dialogRef = inject(DialogService);
  private readonly messageService = inject(MessageService);

  readonly category = input<ItemCategory | null>();
  readonly structureId = input.required<number>();

  saveType = computed<'Modifier' | 'Créer'>(() =>
    this.category() ? 'Modifier' : 'Créer'
  );

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    structure_id: [0, Validators.required],
    identified: [true, Validators.required],
  });

  ngOnInit() {
    if (this.category()) {
      this.form.patchValue({
        name: this.category()!.name,
        structure_id: this.structureId(),
        identified: this.category()!.identified,
      });
    }
  }

  save() {
    if (this.category()) {
      this.categoriesService
        .updateCategory(this.category()!.id, this.form.getRawValue())
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'La catégorie a été mise à jour avec succès.',
            });
            this.ref.close(true);
          },
          error: error => {
            console.error('Error updating category:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail:
                'Une erreur est survenue lors de la mise à jour de la catégorie.',
            });
          },
        });

      return;
    }
    this.categoriesService.createCategory(this.form.getRawValue()).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'La catégorie a été créée avec succès.',
        });
        this.ref.close(true);
      },
      error: error => {
        console.error('Error creating category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail:
            'Une erreur est survenue lors de la création de la catégorie.',
        });
      },
    });
  }

  deleteCategory() {
    this.dialogRef
      .open(
        SimpleModalComponent,
        buildDialogOptions<SimpleModalData>({
          header: `Supprimer la catégorie ${this.category()!.name}`,
          data: {
            confirm: true,
            cancelText: 'Annuler',
            confirmText: 'Supprimer',
            severity: 'danger',
            message: 'Voulez-vous vraiment supprimer cette catégorie ?',
          },
        })
      )!
      .onClose.subscribe(result => {
        if (!result) {
          return;
        }

        this.categoriesService.deleteCategory(this.category()!.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'La catégorie a été supprimée avec succès.',
            });
            this.ref.close(true);
          },
          error: error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail:
                error?.error?.message ||
                'Une erreur est survenue lors de la suppression de la catégorie.',
            });
            console.error('Error deleting category:', error);
          },
        });
      });
  }
}
