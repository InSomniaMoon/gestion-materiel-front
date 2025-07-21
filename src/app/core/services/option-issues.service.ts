import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { tap } from 'rxjs';
import {
  AdminDashboardOptionIssue,
  OptionIssue,
} from '../types/optionIssue.type';
import { PaginatedData } from '../types/paginatedData.type';
import { PaginationRequest } from '../types/pagination-request.type';
import { queryParams } from '../utils/http.utils';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class OptionIssuesService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private api_url = environment.api_url;

  getOptionIssues(itemId: number) {
    const url = `/admin/items/${itemId}/options/issues`;
    return this.http.get<OptionIssue[]>(this.api_url + url);
  }

  create(
    { issue, usable }: { issue: string; usable: boolean },
    itemId: number,
    optionId: number
  ) {
    return this.http
      .post<OptionIssue>(
        `${this.api_url}/items/${itemId}/options/${optionId}/issues`,
        {
          value: issue,
          usable,
        },
        {
          ...CLEAR_CACHE_CONTEXT_OPTIONS(),
        }
      )
      .pipe(
        tap(() => {
          this.cache.clear(
            `${this.api_url}/admin/items/${itemId}/options/issues`
          );
        })
      );
  }

  resolve(issue: OptionIssue) {
    return this.http
      .patch<OptionIssue>(
        `${this.api_url}/options/${issue.item_option_id}/issues/${issue.id}/resolve`,
        {},
        {
          ...CLEAR_CACHE_CONTEXT_OPTIONS(),
        }
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
    return this.http.get<PaginatedData<AdminDashboardOptionIssue>>(url, {
      params: queryParams(opt),
    });
  }
}
