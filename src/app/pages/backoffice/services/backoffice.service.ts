import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ImportStructuresResult } from '@app/core/types/structure-import.type';
import { Structure, StructureWithRole } from '@app/core/types/structure.type';
import { UserStructure } from '@app/core/types/userStructure.type';
import { PaginatedData } from '@core/types/paginatedData.type';
import { User } from '@core/types/user.type';
import { environment } from '@env/environment';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '@utils/injectionToken';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
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
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string | null;
    structureId: string;
  }) {
    return this.http.post(
      `${this.apiUrl}/users`,
      createUser,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  getUserStructures(userId: string) {
    return httpResource<StructureWithRole[]>(
      () => `${this.apiUrl}/users/${userId}/structures`,
      {
        defaultValue: [],
      }
    );
  }

  updateUserStructures(userId: string, userStructures: UserStructure[]) {
    return this.http.put(
      `${this.apiUrl}/users/${userId}/structures`,
      { structures: userStructures },
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  getStructures(params: {
    size?: number;
    page?: number;
    orderBy: string;
    sortBy: string;
    q?: string;
  }): Observable<PaginatedData<Structure>> {
    const { size = 25, page = 1, q = '', orderBy, sortBy = 'asc' } = params;

    return this.http.get<PaginatedData<Structure>>(
      `${this.apiUrl}/structures`,
      {
        params: {
          size,
          page,
          orderBy,
          sortBy,
          q,
        },
      }
    );
  }

  createStructure(dto: {
    name: string;
    description: string | null;
    image: string | null;
  }) {
    return this.http.post(
      `${this.apiUrl}/structures`,
      dto,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  uploadStructureImage = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ path: string }>(
      `${this.apiUrl}/structures/image`,
      formData,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  };

  updateStructure(
    id: number,
    dto: { name: string; description: string | null; image: string | null }
  ) {
    return this.http.put(
      `${this.apiUrl}/structures/${id}`,
      dto,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  importStructures(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ImportStructuresResult>(
      `${this.apiUrl}/structures/import`,
      formData,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.apiUrl}/structures`]))
    );
  }
}
