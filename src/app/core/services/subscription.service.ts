import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Item } from '../types/item.type';
import { Subscription } from '../types/subscription.type';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;

  constructor() {}

  getItemSubscriptions(item: Item) {
    // This method should return an observable of the item subscriptions
    return this.http.get<Subscription[]>(
      `${this.api_url}/items/${item.id}/uses`
    );
  }

  addSubscription(item: Item, subscription: Subscription) {
    // This method should add a subscription
    return this.http.post<Subscription>(
      `${this.api_url}/items/${item.id}/uses`,
      subscription
    );
  }
}
