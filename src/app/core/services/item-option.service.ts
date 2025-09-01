import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ItemOption } from '../types/itemOption.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class ItemOptionService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;
  constructor() {}

  getItemOptions(itemId: number, options?: { withIssues: boolean }) {
    const withIssues = options?.withIssues ?? false;
    return this.http.get<ItemOption[]>(
      `${this.api_url}${withIssues ? '/admin' : ''}/items/${itemId}/options`
    );
  }

  addItemOption(itemId: number, option: ItemOption) {
    return this.http.post<ItemOption>(
      `${this.api_url}/admin/items/${itemId}/options`,
      option,
      CLEAR_CACHE_CONTEXT_OPTIONS(
        new Set([
          `${this.api_url}/items/${itemId}`,
          `${this.api_url}/items/${itemId}/options`,
        ])
      )
    );
  }

  updateItemOption(itemId: number, option: ItemOption) {
    return this.http.put<ItemOption>(
      `${this.api_url}/admin/items/${itemId}/options/${option.id}`,
      option,
      CLEAR_CACHE_CONTEXT_OPTIONS(
        new Set([
          `${this.api_url}/items/${itemId}`,
          `${this.api_url}/items/${itemId}/options`,
        ])
      )
    );
  }

  deleteItemOption(itemId: number, optionId: number) {
    return this.http.delete<ItemOption>(
      `${this.api_url}/admin/items/${itemId}/options/${optionId}`,
      CLEAR_CACHE_CONTEXT_OPTIONS(
        new Set([
          `${this.api_url}/items/${itemId}`,
          `${this.api_url}/items/${itemId}/options`,
        ])
      )
    );
  }
}
