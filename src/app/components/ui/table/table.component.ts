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
      <ng-content select=".paginator" />
    }
  `,
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTable {
  isLoading = computed(
    () =>
      this.status() === 'pending' || this.status() === ResourceStatus.Loading,
  );

  isError = computed(
    () => this.status() === 'error' || this.status() === ResourceStatus.Error,
  );

  status = input.required<'error' | 'success' | 'pending' | ResourceStatus>();

  constructor() {}
}
