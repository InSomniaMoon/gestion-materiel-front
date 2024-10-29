import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ItemOption } from '../types/itemOption.type';

@Injectable({
  providedIn: 'root',
})
export class ItemOptionService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;
  constructor() {}

  getItemOptions(itemId: number) {
    return this.http.get<ItemOption[]>(
      `${this.api_url}/items/${itemId}/options`
    );
  }

  addItemOption(itemId: number, option: ItemOption) {
    return this.http.post<ItemOption>(
      `${this.api_url}/items/${itemId}/options`,
      option
    );
  }

  updateItemOption(itemId: number, option: ItemOption) {
    return this.http.put<ItemOption>(
      `${this.api_url}/items/${itemId}/options/${option.id}`,
      option
    );
  }

  deleteItemOption(itemId: number, optionId: number) {
    return this.http.delete<ItemOption>(
      `${this.api_url}/items/${itemId}/options/${optionId}`
    );
  }
}
