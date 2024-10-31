import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item } from '@app/core/types/item.type';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;

  getItems(searchQuery?: string) {
    let url = `${this.api_url}/items`;
    if (searchQuery) {
      url += `?q=${searchQuery}`;
    }
    return this.http.get<PaginatedData<Item>>(url);
  }

  getItem(id: number) {
    return this.http.get<Item>(`${this.api_url}/items/${id}`);
  }
  updateItem(item: Item) {
    return this.http.put<Item>(`${this.api_url}/items/${item.id}`, item);
  }
}
