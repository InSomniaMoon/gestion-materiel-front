import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item } from '@app/core/types/item.type';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { environment } from '@env/environment';
import { of, tap } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  private api_url = environment.api_url;

  getItems(searchQuery?: string) {
    let url = `${this.api_url}/items`;
    if (searchQuery) {
      url += `?q=${searchQuery}`;
    }

    const cache = this.cache.get<PaginatedData<Item>>(url);

    if (cache) {
      return of(cache);
    }

    return this.http.get<PaginatedData<Item>>(url).pipe(
      tap((items) => {
        this.cache.set(url, items);
      }),
    );
  }

  getItem(id: number) {
    const url = `${this.api_url}/items/${id}`;
    const cache = this.cache.get(url);
    if (cache) {
      return of(cache as Item);
    }

    return this.http.get<Item>(url).pipe(
      tap((item) => {
        this.cache.set(url, item);
      }),
    );
  }
  updateItem(item: Item) {
    return this.http.put<Item>(`${this.api_url}/items/${item.id}`, item).pipe(
      tap(() => {
        this.cache.clear(`${this.api_url}/items/${item.id}`);
      }),
    );
  }
}
