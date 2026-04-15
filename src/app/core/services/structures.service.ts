import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Structure, StructureWithChildren } from '../types/structure.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';

@Injectable({
  providedIn: 'root',
})
export class StructuresService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api_url;

  getAdminStructures() {
    return this.http.get<StructureWithChildren>(
      `${this.baseUrl}/admin/structures`
    );
  }

  getStructures() {
    return this.http.get<StructureWithChildren>(`${this.baseUrl}/structures`);
  }

  updateStructure(id: number, data: Partial<Structure>) {
    return this.http.patch<{ message: string; structure: Structure }>(
      `${this.baseUrl}/admin/structures/${id}`,
      data,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.baseUrl}/admin/structures`]))
    );
  }

  uploadStructureImage = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ path: string }>(
      `${this.baseUrl}/admin/structures/image`,
      formData,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  };

  addUserToStructure(user: { email: string; role: string }) {
    return this.http.post(
      `${this.baseUrl}/admin/structures/users`,
      user,
      CLEAR_CACHE_CONTEXT_OPTIONS(new Set([`${this.baseUrl}/admin/users`]))
    );
  }
}
