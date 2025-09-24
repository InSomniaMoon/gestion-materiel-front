import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { AdminDashboardItemIssue, ItemIssue } from '../types/itemIssue.type';
import { PaginatedData } from '../types/paginatedData.type';
import { PaginationRequest } from '../types/pagination-request.type';
import { queryParams } from '../utils/http.utils';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class ItemIssuesService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private api_url = environment.api_url;

  getItemIssues(itemId: number) {
    const url = `/admin/items/${itemId}/issues`;
    return this.http.get<ItemIssue[]>(this.api_url + url);
  }

  create(
    { issue, usable }: { issue: string; usable: boolean },
    itemId: number
  ) {
    return this.http.post<ItemIssue>(
      `${this.api_url}/items/${itemId}/issues/${issue}`,
      {
        value: issue,
        usable,
      },
      CLEAR_CACHE_CONTEXT_OPTIONS(
        new Set([`${this.api_url}/admin/items/${itemId}/issues`])
      )
    );
  }

  resolve(itemId: number, issue: ItemIssue) {
    return this.http
      .patch<ItemIssue>(
        `${this.api_url}/admin/items/${itemId}/issues/${issue.id}/resolve`,
        {},

        CLEAR_CACHE_CONTEXT_OPTIONS(
          new Set([`${this.api_url}/admin/items/${itemId}/options`])
        )
      )
      .pipe();
  }

  getPaginatedOpenedIssues(
    opt: Partial<PaginationRequest> = {
      page: 1,
      size: 25,
    }
  ) {
    const url = `${this.api_url}/admin/issues/open`;
    return this.http.get<PaginatedData<AdminDashboardItemIssue>>(url, {
      params: queryParams(opt),
    });
  }
}
