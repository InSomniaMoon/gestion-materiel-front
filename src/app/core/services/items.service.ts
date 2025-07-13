import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item, ItemCategory } from '@app/core/types/item.type';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { environment } from '@env/environment';
import { queryParams } from '../utils/http.utils';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  private api_url = environment.api_url;

  createItem(item: Item) {
    return this.http.post<Item>(`${this.api_url}/admin/items`, item, {
      ...CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/items`])),
    });
  }

  getItems(
    opt: {
      q?: string;
      size?: number;
      page?: number;
      order_by?: string;
      category_id?: number;
    } = {
      page: 1,
      size: 25,
    }
  ) {
    let url = `${this.api_url}/items`;

    return this.http.get<PaginatedData<Item>>(url, {
      params: queryParams(opt),
    });
  }

  getItem(id: number) {
    const url = `${this.api_url}/items/${id}`;

    return this.http.get<Item>(url);
  }

  updateItem(item: Item) {
    return this.http.put<Item>(`${this.api_url}/items/${item.id}`, item);
  }

  getCategories() {
    const url = `${this.api_url}/items/categories`;
    return this.http.get<ItemCategory[]>(url);
  }
}
