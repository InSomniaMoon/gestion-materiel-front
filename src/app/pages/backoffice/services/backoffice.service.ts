import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Structure, StructureWithPivot } from '@app/core/types/structure.type';
import { UserGroup } from '@app/core/types/userStructure.type';
import { PaginatedData } from '@core/types/paginatedData.type';
import { User } from '@core/types/user.type';
import { environment } from '@env/environment';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '@utils/injectionToken';
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
    structure_id: string;
  }) {
    return this.http.post(
      `${this.apiUrl}/users`,
      createUser,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  getUserGroups(userId: string) {
    return httpResource<StructureWithPivot[]>(
      () => `${this.apiUrl}/users/${userId}/groups`,
      {
        defaultValue: [],
      }
    );
  }

  updateUserGroups(userId: string, userGroups: UserGroup[]) {
    return this.http.put(
      `${this.apiUrl}/users/${userId}/groups`,
      { groups: userGroups },
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  getGroups(): Observable<StructureWithPivot[]>;
  getGroups(params?: {
    size?: number;
    page?: number;
    orderBy: string;
    sortBy: string;
    q?: string;
  }): Observable<PaginatedData<Structure>>;
  getGroups(params?: {
    size?: number;
    page?: number;
    orderBy: string;
    sortBy?: string;
    q?: string;
  }): Observable<Structure[] | PaginatedData<Structure>> {
    if (!params) {
      return this.http.get<Structure[]>(`${this.apiUrl}/groups?all=true`);
    }

    const { size = 25, page = 1, q = '', orderBy, sortBy = 'asc' } = params!;

    return this.http.get<PaginatedData<Structure>>(`${this.apiUrl}/groups`, {
      params: {
        size,
        page,
        orderBy,
        sortBy,
        q,
      },
    });
  }

  createGroup(dto: {
    name: string;
    description: string | null;
    image: string | null;
  }) {
    return this.http.post(
      `${this.apiUrl}/groups`,
      dto,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  uploadGroupImage = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ path: string }>(
      `${this.apiUrl}/groups/image`,
      formData,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  };

  updateGroup(
    id: number,
    dto: { name: string; description: string | null; image: string | null }
  ) {
    return this.http.put(
      `${this.apiUrl}/groups/${id}`,
      dto,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }
}
