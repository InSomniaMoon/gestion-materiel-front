import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SortBy } from '@app/core/types/pagination-request.type';
import { AdminDashboardOptionIssue } from '@core/types/optionIssue.type';
import { environment } from '@env/environment';
import { OptionIssuesService } from '@services/option-issues.service';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { PaginatorState } from 'primeng/paginator';
import { lastValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, Card, ButtonDirective, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private optionIssuesService = inject(OptionIssuesService);

  baseUrl = environment.api_url + '/storage/';

  page = signal(0);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');
  sortBy = signal<1 | -1>(1);
  first = computed(() => this.page() * this.size());

  onPageChange(event: PaginatorState) {
    console.log('Page changed:', event);

    this.page.set(event.page!);
    this.size.set(event.rows!);
  }
  issuesResource = resource({
    params: () => ({
      page: this.page() + 1,
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: (this.sortBy() === 1 ? 'asc' : 'desc') as SortBy,
    }),
    loader: ({ params }) =>
      lastValueFrom(
        this.optionIssuesService.getPaginatedOpenedIssues(params).pipe(
          tap(issues => {
            this._issues.update(v => [...v, ...issues.data]);
          })
        )
      ),
  });

  private _issues = signal<AdminDashboardOptionIssue[]>([]);

  issues = computed(() => {
    const items: Record<string, AdminDashboardOptionIssue[]> = {};
    if (!this._issues()) return [];
    this._issues().forEach(issue => {
      const key = issue.item_option!.item!.name;
      if (!items[key]) {
        items[key] = [];
      }

      items[key].push(issue);
    });

    return Object.entries(items).map(([key, value]) => ({
      name: key,
      id: value[0].item_option!.item!.id,
      issues: value,
    }));
  });
}
