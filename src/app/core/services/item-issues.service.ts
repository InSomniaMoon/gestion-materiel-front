import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { AdminDashboardItemIssue, ItemIssue } from '../types/itemIssue.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class ItemIssuesService {
  private readonly http = inject(HttpClient);
  private readonly api_url = environment.api_url;

  getItemIssues(itemId: number) {
    const url = `/items/${itemId}/issues`;
    return this.http.get<ItemIssue[]>(this.api_url + url);
  }

  create(
    {
      issue,
      usable,
      affectedQuantity,
    }: { issue: string; usable: boolean; affectedQuantity: number },
    itemId: number
  ) {
    return this.http.post<ItemIssue>(
      `${this.api_url}/items/${itemId}/issues`,
      {
        value: issue,
        usable,
        affectedQuantity,
      },
      CLEAR_CACHE_CONTEXT_OPTIONS(
        new Set([
          `${this.api_url}/items/${itemId}/issues`,
          `${this.api_url}/items/${itemId}`,
          `${this.api_url}/items`,
        ])
      )
    );
  }

  resolve(itemId: number, issue: ItemIssue) {
    return this.http
      .patch<ItemIssue>(
        `${this.api_url}/admin/issues/${issue.id}/resolve`,
        {},

        CLEAR_CACHE_CONTEXT_OPTIONS(
          new Set([
            `${this.api_url}/admin/items/${itemId}/issues`,
            `${this.api_url}/admin/items`,
            `${this.api_url}/items`,
          ])
        )
      )
      .pipe();
  }

  getOpenedIssues() {
    const url = `${this.api_url}/admin/issues/open`;
    return this.http.get<AdminDashboardItemIssue[]>(url);
  }
}
