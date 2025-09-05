import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ItemCategory } from '../types/item.type';
import { PaginatedData } from '../types/paginatedData.type';
import { PaginationRequest } from '../types/pagination-request.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.api_url;

  private readonly urlSet = new Set([
    this.baseUrl + '/admin/items/categories',
    this.baseUrl + 'items/categories',
  ]);

  getCategories(pagination: Partial<PaginationRequest>) {
    return this.http.get<PaginatedData<ItemCategory>>(
      `${this.baseUrl}/admin/items/categories`,
      {
        params: pagination,
      }
    );
  }

  createCategory(category: Partial<ItemCategory>) {
    return this.http.post<ItemCategory>(
      `${this.baseUrl}/admin/items/categories`,
      category,
      CLEAR_CACHE_CONTEXT_OPTIONS(this.urlSet)
    );
  }
  updateCategory(categoryId: number, category: Partial<ItemCategory>) {
    return this.http.patch<ItemCategory>(
      `${this.baseUrl}/admin/items/categories/${categoryId}`,
      category,
      CLEAR_CACHE_CONTEXT_OPTIONS(this.urlSet)
    );
  }

  deleteCategory(categoryId: number) {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/items/categories/${categoryId}`,
      CLEAR_CACHE_CONTEXT_OPTIONS(this.urlSet)
    );
  }
}
