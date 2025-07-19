import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = environment.api_url;

  addUserToGroup(user: { email: string; role: string }) {
    return this.httpClient.post(`${this.apiUrl}/admin/groups/users`, user);
  }
}
