import { Injectable } from '@angular/core';
import { url } from 'inspector';

export interface CacheData<T> {
  expires: Date;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  // A HashMap to store the cache. The key is the page and the value is the data.
  private cache = new Map<string, CacheData<any>>();
  // BehaviorSubject that will contain the updated cache data.

  // The 'set' method for storing data in the cache.
  set(key: string, data: any): void {
    // We check if data already exists for this key.
    if (this.cache.has(key)) {
      // If it already exists, we throw an exception to prevent overwriting the data.
      throw new Error(
        `Data already exists for key '${key}'. Use a different key or delete the existing one first.`
      );
    }
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    // If there is no data for this key, we store it in the cache and update the BehaviorSubject.
    this.cache.set(key, { expires, data });
  }

  // The 'get' method for retrieving data from the cache.
  get<T>(key: string): T | null {
    // We retrieve the data from the cache and update the BehaviorSubject.
    const data = this.cache.get(key);

    if (!data || data.expires < new Date()) {
      this.cache.delete(key);
      return null;
    }
    return data.data;
  }

  // The 'clear' method to clear data from the cache.
  clear(key: string): void {
    // We remove the data from the cache and update the BehaviorSubject.
    this.cache.delete(key);
  }

  clearAll(): void;
  clearAll(regex: RegExp): void;
  clearAll(urls: RegExp[]): void;
  clearAll(param?: RegExp | RegExp[]): void {
    if (param instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (param.test(key)) {
          console.log(`Clearing cache for key: ${key}`);

          this.cache.delete(key);
        }
      }
      return;
    }
    if (param instanceof Array) {
      param.forEach((url) => {
        this.clearAll(url);
      });
      return;
    }
    this.cache.clear();
  }
}
