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

    return this.http.get<OptionIssue[]>(this.api_url + url);
  }

  create(issue: string, itemId: number, optionId: number) {
    return this.http
      .post<OptionIssue>(
        `${this.api_url}/items/${itemId}/options/${optionId}/issues`,
        {
          value: issue,
        },
      )
      .pipe(
        tap(() => {
          this.cache.clear(`${this.api_url}/items/${itemId}/options/issues`);
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
