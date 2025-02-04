import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { User } from '@app/core/types/user.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '@app/core/utils/injectionToken';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'any',
})
export class BackofficeService {
  private readonly apiUrl = `${environment.api_url}/backoffice`;

  private readonly http = inject(HttpClient);

  constructor() {}

  getUsers({
    size = 25,
    page = 1,
    q = '',
    orderBy,
    sortBy = 'asc',
  }: {
    size: number;
    page: number;
    orderBy: string;
    sortBy: string;
    q: string;
  }) {
    return this.http.get<PaginatedData<User>>(`${this.apiUrl}/users`, {
      params: {
        size,
        page,
        orderBy,
        sortBy,
        q,
      },
    });
  }

  createUser(createUser: {
    name: string;
    email: string;
    role: string;
    phone: string | null;
  }) {
    return this.http.post(`${this.apiUrl}/users`, createUser, {
      ...CLEAR_CACHE_CONTEXT_OPTIONS(),
    });
  }
}
