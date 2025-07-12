import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map } from 'rxjs';
import { IssueComment } from '../types/issueComment.type';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentsService {
  private readonly http = inject(HttpClient);

  private api_url = environment.api_url;

  getComments(optionId: number, issueId: number) {
    return this.http
      .get<IssueComment[]>(
        `${this.api_url}/admin/options/${optionId}/issues/${issueId}/comments`
      )
      .pipe(
        map((comments) =>
          comments.map((comment) => {
            comment.created_at = new Date(comment.created_at);
            return comment;
          })
        )
      );
  }

  addComment(optionId: number, issueId: number, comment: string) {
    return this.http.post<IssueComment>(
      `${this.api_url}/admin/options/${optionId}/issues/${issueId}/comments`,
      {
        comment,
      }
    );
  }
}
