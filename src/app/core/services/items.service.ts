import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item, ItemCategory, ItemWithQuantity } from '@core/types/item.type';
import { PaginatedData } from '@core/types/paginatedData.type';
import { environment } from '@env/environment';
import { PaginationRequest } from '../types/pagination-request.type';
import { queryParams } from '../utils/http.utils';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);
  private readonly api_url = environment.api_url;

  createItem(item: Item) {
    return this.http.post<Item>(
      `${this.api_url}/admin/items`,
      item,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/items`]))
    );
  }

  getItems(opt?: Partial<PaginationRequest> & { category_id?: number }) {
    let url = `${this.api_url}/items`;
    const options = opt ?? { page: 1, size: 25 };

    return this.http.get<PaginatedData<Item>>(url, {
      params: queryParams(options),
    });
  }

  getAvailableItems(
    opt?: Partial<PaginationRequest> & { start_date?: Date; end_date?: Date },
    forEvent?: number
  ) {
    let url = `${this.api_url}/items/available`;
    const options = {
      page: 1,
      size: 25,
      start_date: new Date(),
      end_date: new Date(),
      ...opt,
    };

    return this.http.get<PaginatedData<ItemWithQuantity>>(url, {
      params: queryParams({
        ...options,
        start_date: options.start_date.toISOString(),
        end_date: options.end_date.toISOString(),
        for_event: forEvent,
      }),
    });
  }

  getAdminItems(opt?: Partial<PaginationRequest> & { category_id?: number }) {
    let url = `${this.api_url}/admin/items`;
    const options = opt ?? { page: 1, size: 25 };

    return this.http.get<PaginatedData<Item>>(url, {
      params: queryParams(options),
    });
  }

  getItem(id: number) {
    const url = `${this.api_url}/items/${id}`;

    return this.http.get<Item>(url);
  }

  updateItem(item: Item) {
    return this.http.put<Item>(
      `${this.api_url}/admin/items/${item.id}`,
      item,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/items`]))
    );
  }
  deleteItem(item: Item) {
    return this.http.delete<Item>(
      `${this.api_url}/admin/items/${item.id}`,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/items`]))
    );
  }

  getCategories(search?: string) {
    const url = `${this.api_url}/items/categories`;
    return this.http.get<PaginatedData<ItemCategory>>(url, {
      params: queryParams({ q: search }),
    });
  }

  uploadImage = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ path: string }>(
      `${this.api_url}/admin/items/images`,
      formData,

      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  };
}
