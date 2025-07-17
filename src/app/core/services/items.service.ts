import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item, ItemCategory } from '@app/core/types/item.type';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { environment } from '@env/environment';
import { PaginationRequest } from '../types/pagination-request.type';
import { queryParams } from '../utils/http.utils';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);
  private api_url = environment.api_url;

  createItem(item: Item) {
    return this.http.post<Item>(`${this.api_url}/admin/items`, item, {
      ...CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/items`])),
    });
  }

  getItems(
    opt: {
      category_id?: number;
    } & Partial<PaginationRequest> = {
      page: 1,
      size: 25,
    }
  ) {
    let url = `${this.api_url}/items`;

    return this.http.get<PaginatedData<Item>>(url, {
      params: queryParams(opt),
    });
  }

  getAvailableItems(
    opt: Partial<PaginationRequest> & { start_date: Date; end_date: Date } = {
      page: 1,
      size: 25,
      start_date: new Date(),
      end_date: new Date(),
    }
  ) {
    let url = `${this.api_url}/items/available`;

    return this.http.get<PaginatedData<Item>>(url, {
      params: queryParams({
        ...opt,
        start_date: opt.start_date.toISOString(),
        end_date: opt.end_date.toISOString(),
      }),
    });
  }

  getAdminItems(
    opt: {
      q?: string;
      size?: number;
      page?: number;
      order_by?: string;
      category_id?: number;
      sort_by?: string;
    } = {
      page: 1,
      size: 25,
    }
  ) {
    let url = `${this.api_url}/admin/items`;

    return this.http.get<PaginatedData<Item>>(url, {
      params: queryParams(opt),
    });
  }

  getItem(id: number) {
    const url = `${this.api_url}/items/${id}`;

    return this.http.get<Item>(url);
  }

  updateItem(item: Item) {
    return this.http.put<Item>(`${this.api_url}/admin/items/${item.id}`, item, {
      ...CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/items`])),
    });
  }
  deleteItem(item: Item) {
    return this.http.delete<Item>(`${this.api_url}/admin/items/${item.id}`, {
      ...CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/items`])),
    });
  }

  getCategories() {
    const url = `${this.api_url}/items/categories`;
    return this.http.get<ItemCategory[]>(url);
  }

  uploadImage = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ path: string }>(
      `${this.api_url}/admin/items/images`,
      formData,
      {
        ...CLEAR_CACHE_CONTEXT_OPTIONS(),
      }
    );
  };
}
