import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@app/components/ui/paginator/paginator.component';
import { AppTable } from '@app/components/ui/table/table.component';
import { TableLayoutService } from '@app/core/services/table-layout.service';
import { ItemCategory } from '@core/types/item.type';
import { AuthService } from '@services/auth.service';
import { CategoriesService } from '@services/categories.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { buildDialogOptions } from '@utils/constants';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DataView } from 'primeng/dataview';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { CreateUpdateCategoryComponent } from '../create-update-category/create-update-category.component';

@Component({
  selector: 'app-categories-list',
  imports: [
    Select,
    Button,
    AppTable,
    TableModule,
    FormsModule,
    PaginatorComponent,
    DataView,
    SelectButton,
    Card,
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialogRef = inject(DialogService);
  private readonly tableLayoutService = inject(TableLayoutService);
  private selectedStructure = inject(AuthService).selectedStructure;

  sortOptions = [{ label: 'Nom', value: 'name' }];

  page = signal(0);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');
  sortBy = signal(1);

  switchSortOrder() {
    this.sortBy.set(this.sortBy() === 1 ? -1 : 1);
  }
  dataViewType = [
    { label: 'Liste', value: 'list' },
    { label: 'Tableau', value: 'grid' },
  ];
  layout = this.tableLayoutService.layout;
  setLayout(layout: 'list' | 'grid') {
    this.tableLayoutService.setLayout(layout);
  }

  categoriesQuery = injectQuery(() => ({
    queryKey: [
      'categories',
      this.page(),
      this.size(),
      this.searchQuery(),
      this.orderBy(),
      this.selectedStructure(),
      this.sortBy(),
    ],
    queryFn: () =>
      lastValueFrom(
        this.categoriesService.getCategories({
          page: this.page() + 1,
          size: this.size(),
          q: this.searchQuery(),
          order_by: this.orderBy(),
          sort_by: this.sortBy() === 1 ? 'asc' : 'desc',
        })
      ),
    initialPageParam: { page: 1, pageSize: 10 },
    keepPreviousData: true,
  }));

  onPageChange(event: PaginatorState) {
    this.page.set(event.page!);
    this.size.set(event.rows!);
  }

  openCreateCategroyModal() {
    this.dialogRef
      .open(
        CreateUpdateCategoryComponent,
        buildDialogOptions({
          header: 'Créer une catégorie',
          width: '50%',
          inputValues: { structureId: this.selectedStructure()!.id },
        })
      )!
      .onClose.subscribe(result => {
        if (result) {
          this.categoriesQuery.refetch();
        }
      });
  }

  openUpdateCategoryModal(category: ItemCategory) {
    this.dialogRef
      .open(
        CreateUpdateCategoryComponent,
        buildDialogOptions({
          header: 'Modifier la catégorie',
          width: '50%',
          inputValues: {
            category: category,
            structureId: this.selectedStructure()!.id,
          },
        })
      )!
      .onClose.subscribe(result => {
        if (result) {
          this.categoriesQuery.refetch();
        }
      });
  }
}
