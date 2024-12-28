import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map, of, tap } from 'rxjs';
import { Item } from '../types/item.type';
import { Subscription } from '../types/subscription.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly http = inject(HttpClient);

  private readonly cache = inject(CacheService);

  private api_url = environment.api_url;

  constructor() {}

  getItemSubscriptions(item: Item) {
    const url = `${this.api_url}/items/${item.id}/uses`;

    const cache = this.cache.get<Subscription[]>(url);

    if (cache) {
      return of(cache);
    }
    // This method should return an observable of the item subscriptions
    return this.http.get<Subscription[]>(url);
  }

  addSubscription(item: Item, subscription: Subscription) {
    // This method should add a subscription
    const url = `${this.api_url}/items/${item.id}/uses`;

    return this.http.post<Subscription>(
      url,
      subscription,
      CLEAR_CACHE_CONTEXT_OPTIONS,
    );
  }

  getItemSubscription(itemId: number, subscriptionId: number) {
    const url = `${this.api_url}/items/${itemId}/uses/${subscriptionId}`;

    const cache = this.cache.get<Subscription>(url);

    if (cache) {
      return of(cache);
    }
    // This method should return an observable of the item subscription
    return this.http.get<Subscription>(url).pipe(
      map((subscription: Subscription) => {
        subscription.start_date = new Date(subscription.start_date);
        subscription.end_date = new Date(subscription.end_date);
        return subscription;
      }),
    );
  }
}
