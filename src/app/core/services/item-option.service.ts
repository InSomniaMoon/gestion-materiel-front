import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemOptionService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;
  constructor() {}

  // getItemOptions(itemId: number) {
  //   return this.http.get(`${this.api_url}/items/${itemId}/options`);
  // }
}
