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

  getItems() {
    return this.http.get<PaginatedData<Item>>(`${this.api_url}/items`);
  }

  getItem(id: number) {
    return this.http.get<Item>(`${this.api_url}/items/${id}`);
  }
}
