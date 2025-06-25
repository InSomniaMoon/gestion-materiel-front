import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Group } from '@app/core/types/group.type';
import { PaginatedData } from '@app/core/types/paginatedData.type';
import { User } from '@app/core/types/user.type';
import { UserGroup } from '@app/core/types/userGroup.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '@app/core/utils/injectionToken';
import { environment } from '@env/environment';
import { resourceUsage } from 'process';
import { Observable } from 'rxjs';

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
    group_id: string;
  }) {
    return this.http.post(`${this.apiUrl}/users`, createUser, {
      ...CLEAR_CACHE_CONTEXT_OPTIONS(),
    });
  }

  getUserGroups(userId: string) {
    return httpResource<UserGroup[]>(`${this.apiUrl}/users/${userId}/groups`, {
      defaultValue: [],
    });
    // return this.http.get<Group[]>(`${this.apiUrl}/users/${userId}/groups`);
  }

  updateUserGroups(
    userId: string,
    groups_to_add: { id: number; role: string }[],
    groups_to_update: { id: number; role: string }[],
    groups_to_remove: number[],
  ) {
    return this.http.put(
      `${this.apiUrl}/users/${userId}/groups`,
      {
        groups_to_add,
        groups_to_update,
        groups_to_remove,
      },
      {
        ...CLEAR_CACHE_CONTEXT_OPTIONS(),
      },
    );
  }

  getGroups(): Observable<Group[]>;
  getGroups(params?: {
    size?: number;
    page?: number;
    orderBy: string;
    sortBy: string;
    q?: string;
  }): Observable<PaginatedData<Group>>;
  getGroups(params?: {
    size?: number;
    page?: number;
    orderBy: string;
    sortBy?: string;
    q?: string;
  }): Observable<Group[] | PaginatedData<Group>> {
    if (!params) {
      return this.http.get<Group[]>(`${this.apiUrl}/groups?all=true`);
    }

    const { size = 25, page = 1, q = '', orderBy, sortBy = 'asc' } = params!;

    return this.http.get<PaginatedData<Group>>(`${this.apiUrl}/groups`, {
      params: {
        size,
        page,
        orderBy,
        sortBy,
        q,
      },
    });
  }

  createGroup(dto: { name: string; description: string | null }) {
    return this.http.post(`${this.apiUrl}/groups`, dto, {
      ...CLEAR_CACHE_CONTEXT_OPTIONS(),
    });
  }
}
