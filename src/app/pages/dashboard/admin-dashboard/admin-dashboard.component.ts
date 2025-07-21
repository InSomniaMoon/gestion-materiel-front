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
import { OptionIssuesService } from '@app/core/services/option-issues.service';
import { AdminDashboardOptionIssue } from '@app/core/types/optionIssue.type';
import { environment } from '@env/environment';
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

  options = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];
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
      page: this.page(),
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: this.sortBy() === 1 ? 'asc' : 'desc',
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
    this._issues().forEach(issue => {
      const key = issue.item_option!.item!.name;
      if (!items[key]) {
        items[key] = [];
      }
      if (issue.item_option?.item !== undefined) {
        delete issue.item_option.item;
      }
      items[key].push(issue);
    });

    return Object.entries(items).map(([key, value]) => ({
      name: key,
      issues: value,
    }));
  });
}
