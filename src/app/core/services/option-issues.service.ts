import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { of, tap } from 'rxjs';
import { OptionIssue } from '../types/optionIssue.type';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class OptionIssuesService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private api_url = environment.api_url;

  getOptionIssues(itemId: number) {
    const url = `/items/${itemId}/options/issues`;
    const cache = this.cache.get<OptionIssue[]>(url);

    if (cache) {
      return of(cache);
    }

    return this.http.get<OptionIssue[]>(this.api_url + url).pipe(
      tap((issues) => {
        this.cache.set(url, issues);
      }),
    );
  }

  resolve(issue: OptionIssue) {
    return this.http
      .patch<OptionIssue>(
        `${this.api_url}/options/${issue.item_option_id}/issues/${issue.id}/resolve`,
        {},
      )
      .pipe();
  }
}
