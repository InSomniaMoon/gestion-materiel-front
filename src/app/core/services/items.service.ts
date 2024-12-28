import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item } from '@app/core/types/item.type';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { environment } from '@env/environment';
import { of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly authService = inject(AuthService);

  private api_url = environment.api_url;

  createItem(item: Item) {
    return this.http.post<Item>(`${this.api_url}/items`, item).pipe(
      tap(() => {
        this.cache.clear(`${this.api_url}/items`);
      }),
    );
  }

  getItems(
    opt: {
      searchQuery?: string;
      size?: number;
      page?: number;
      orderBy?: string;
      category?: string;
    } = {
      page: 1,
      size: 25,
    },
  ) {
    let url = `${this.api_url}/items`;

    url += `?group_id=${this.authService.selectedGroup()?.group_id}`;
    url += `&page=${opt.page}`;

    url += `&size=${opt.size}`;

    if (opt.orderBy) {
      url += `&order_by=${opt.orderBy}`;
    }
    if (opt.searchQuery) {
      url += `?q=${opt.searchQuery}`;
    }

    if (opt.category) {
      console.log(opt.category);

      url += `&category=${opt.category}`;
    }

    return this.http.get<PaginatedData<Item>>(url);
  }

  getItem(id: number) {
    const url = `${this.api_url}/items/${id}`;

    return this.http.get<Item>(url);
  }

  updateItem(item: Item) {
    return this.http.put<Item>(`${this.api_url}/items/${item.id}`, item).pipe(
      tap(() => {
        this.cache.clear(`${this.api_url}/items/${item.id}`);
        this.cache.clear(`${this.api_url}/items`);
      }),
    );
  }

  getCategories() {
    const url = `${this.api_url}/items/categories`;

    return this.http.get<string[]>(url);
  }
}
