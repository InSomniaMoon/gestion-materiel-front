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
import { AuthService } from '@app/core/services/auth.service';
import { ItemIssuesService } from '@app/core/services/item-issues.service';
import { AdminDashboardItemIssue } from '@app/core/types/itemIssue.type';
import { SortBy } from '@app/core/types/pagination-request.type';
import { environment } from '@env/environment';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { PaginatorState } from 'primeng/paginator';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, Card, ButtonDirective, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly itemIssuesService = inject(ItemIssuesService);
  private readonly authService = inject(AuthService);
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
      triggerChange: this.authService.selectedStructure(),
    }),
    loader: ({ params }) =>
      lastValueFrom(
        this.itemIssuesService.getPaginatedOpenedIssues(params).pipe()
      ),
  });

  private readonly _issues = computed(
    () => this.issuesResource.value()?.data || []
  );

  issues = computed(() => {
    const items: Record<string, AdminDashboardItemIssue[]> = {};
    if (!this._issues()) return [];
    this._issues().forEach(issue => {
      if (!issue.item) {
        return;
      }

      const key = issue.item.name;
      if (!items[key]) {
        items[key] = [];
      }
      items[key].push(issue);
    });

    return Object.entries(items).map(([key, value]) => ({
      name: key,
      id: value[0].item!.id,
      issues: value,
    }));
  });
}
