import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '@app/components/simple-modal/simple-modal.component';
import { AppTable } from '@app/components/ui/table/table.component';
import { AuthService } from '@app/core/services/auth.service';
import { CategoriesService } from '@app/core/services/categories.service';
import { ItemCategory } from '@app/core/types/item.type';
import { DIALOG_RESPONSIVE_BREAKPOINTS } from '@app/core/utils/constants';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { CreateUpdateCategoryComponent } from '../create-update-category/create-update-category.component';

@Component({
  selector: 'app-categories-list',
  imports: [Select, Button, AppTable, TableModule, Paginator, FormsModule],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialogRef = inject(DialogService);
  private selectedGroup = inject(AuthService).selectedGroup;

  options = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];
  page = signal(0);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');

  categoriesQuery = injectQuery(() => ({
    queryKey: [
      'categories',
      this.page(),
      this.size(),
      this.searchQuery(),
      this.orderBy(),
      this.selectedGroup(),
    ],
    queryFn: () =>
      lastValueFrom(
        this.categoriesService.getCategories({
          page: this.page(),
          size: this.size(),
          q: this.searchQuery(),
          order_by: this.orderBy(),
          sort_by: 'name',
        })
      ),
    initialPageParam: { page: 1, pageSize: 10 },
    keepPreviousData: true,
  }));

  onPageChange(event: PaginatorState) {
    this.page.set(event.page! + 1);
    this.size.set(event.rows!);
  }

  openCreateCategroyModal() {
    this.dialogRef
      .open(CreateUpdateCategoryComponent, {
        data: { groupId: this.selectedGroup()!.id },
        header: 'Créer une catégorie',
        width: '50%',
        closeOnEscape: true,
        dismissableMask: true,
        modal: true,
        breakpoints: DIALOG_RESPONSIVE_BREAKPOINTS,
      })
      .onClose.subscribe(result => {
        if (result) {
          this.categoriesQuery.refetch();
        }
      });
  }

  openUpdateCategoryModal(category: ItemCategory) {
    this.dialogRef
      .open(CreateUpdateCategoryComponent, {
        data: { category, groupId: this.selectedGroup()!.id },
        header: 'Modifier la catégorie',
        width: '50%',
        closeOnEscape: true,
        dismissableMask: true,
        modal: true,
        breakpoints: DIALOG_RESPONSIVE_BREAKPOINTS,
      })
      .onClose.subscribe(result => {
        if (result) {
          this.categoriesQuery.refetch();
        }
      });
  }

  deleteCategory(category: ItemCategory) {
    const config: DynamicDialogConfig<SimpleModalData> = {
      header: `Supprimer la catégorie ${category.name}`,
      height: 'auto',
      modal: true,
      dismissableMask: true,
      data: {
        confirm: true,
        cancelText: 'Annuler',
        confirmText: 'Supprimer',
        message: 'Voulez-vous vraiment supprimer cette catégorie ?',
      },
      breakpoints: DIALOG_RESPONSIVE_BREAKPOINTS,
    };
    this.dialogRef
      .open(SimpleModalComponent, config)
      .onClose.subscribe(result => {
        if (!result) {
          return;
        }

        this.categoriesService.deleteCategory(category.id).subscribe({
          next: () => {
            this.categoriesQuery.refetch();
          },
          error: error => {
            console.error('Error deleting category:', error);
          },
        });
      });
  }
}
