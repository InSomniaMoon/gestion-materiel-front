import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class CreateUpdateCategoryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  readonly ref = inject(DynamicDialogRef);
  private readonly dialogRef = inject(DialogService);
  private readonly messageService = inject(MessageService);

  readonly data = this.dialogRef.getInstance(this.ref).data;

  saveType = signal<'Modifier' | 'Créer'>(
    this.data.category ? 'Modifier' : 'Créer'
  );

  form = this.fb.nonNullable.group({
    name: [this.data.category?.name, [Validators.required]],
    group_id: [this.data.groupId, Validators.required],
    identified: [this.data.category?.identified ?? true, Validators.required],
  });

  save() {
    if (this.data.category) {
      this.categoriesService
        .updateCategory(this.data.category.id, this.form.getRawValue())
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
}
