import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ResourceStatus,
} from '@angular/core';

@Component({
  selector: 'matos-table',
  imports: [],
  template: `
    <ng-content select="[header]" />
    @if (!isLoading() && !isError()) {
      <div class="table-container">
        <ng-content select="p-table]" />
      </div>
    }
    @if (isLoading()) {
      <div class="loading">
        <div class="loader" style="scale:2;"></div>
      </div>
    }
    @if (isError()) {
      <div class="error">
        <ng-content select="[error-content]">
          <span>Error loading data</span>
        </ng-content>
      </div>
    } @else {
      <ng-content select="app-paginator" />
    }
  `,
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTable {
  isLoading = computed(
    () => this.status() === 'pending' || this.status() === 'loading'
  );

  isError = computed(() => this.status() === 'error');

  status = input.required<'error' | 'success' | 'pending' | ResourceStatus>();

  constructor() {}
}
