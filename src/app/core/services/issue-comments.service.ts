import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map } from 'rxjs';
import { IssueComment } from '../types/issueComment.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentsService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;

  getComments(itemId: number, optionId: number, issueId: number) {
    return this.http
      .get<
        IssueComment[]
      >(`${this.api_url}/admin/items/${itemId}/options/${optionId}/issues/${issueId}/comments`, CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.api_url}/admin/items/${itemId}/options/${optionId}/issues/${issueId}`])))
      .pipe(
        map(comments =>
          comments.map(comment => {
            comment.created_at = new Date(comment.created_at);
            return comment;
          })
        )
      );
  }

  addComment(
    itemId: number,
    optionId: number,
    issueId: number,
    comment: string
  ) {
    return this.http.post<IssueComment>(
      `${this.api_url}/admin/items/${itemId}/options/${optionId}/issues/${issueId}/comments`,
      {
        comment,
      }
    );
  }
}
