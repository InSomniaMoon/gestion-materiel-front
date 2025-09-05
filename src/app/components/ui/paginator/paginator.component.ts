import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Paginator } from 'primeng/paginator';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-paginator',
  imports: [Select, Paginator, FormsModule],
  styleUrl: './paginator.component.scss',
  template: `<span>Items par page: </span>
    <p-select
      [options]="options()"
      optionLabel="label"
      optionValue="value"
      [ngModel]="size()"
      (ngModelChange)="onPageChangeEvent($event)" />
    <p-paginator
      [first]="first()"
      [rows]="size()"
      [totalRecords]="totalRecords()"
      (onPageChange)="page.set($event.page!); size.set($event.rows!)"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="page {currentPage} / {totalPages}"
      [showPageLinks]="false"
      [showFirstLastIcon]="false" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  options = input([
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ]);

  size = model.required<number>();
  page = model.required<number>();
  totalRecords = input.required<number>();

  first = computed(() => this.page() * this.size());

  onPageChangeEvent(size: any) {
    this.size.set(size);
    this.page.set(0);
  }
}
