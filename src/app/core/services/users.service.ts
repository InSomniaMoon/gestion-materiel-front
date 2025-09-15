import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { PaginatedData } from '../types/paginatedData.type';
import { PaginationRequest } from '../types/pagination-request.type';
import { User } from '../types/user.type';
import { queryParams } from '../utils/http.utils';
import {
  CLEAR_CACHE_CONTEXT_OPTIONS,
  NO_CACHE_CONTEXT_OPTIONS,
} from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly api_url = environment.api_url;

  getPaginatedUsers(
    opt: Partial<PaginationRequest> = {
      page: 1,
      size: 25,
    }
  ) {
    return this.http.get<PaginatedData<User>>(`${this.api_url}/admin/users`, {
      params: queryParams(opt),
    });
  }

  checkUser(email: string) {
    return this.http.get<{ exists: boolean; already_in_group: boolean }>(
      `${this.api_url}/admin/users/exists`,
      {
        ...NO_CACHE_CONTEXT_OPTIONS,
        params: { email },
      }
    );
  }

  createUserForGroup(user: Partial<User>) {
    return this.http.post<{ created: boolean }>(
      `${this.api_url}/admin/users`,
      user,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set(['/backoffice/users']))
    );
  }

  sendPasswordReset(email: string) {
    return this.http.post(
      `${this.api_url}/users/send-reset-password`,
      { email },
      NO_CACHE_CONTEXT_OPTIONS
    );
  }
}
