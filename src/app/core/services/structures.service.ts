import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { StructureWithChildren } from '../types/structure.type';

@Injectable({
  providedIn: 'root',
})
export class StructuresService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api_url;

  getStructures() {
    return this.http.get<StructureWithChildren>(
      `${this.baseUrl}/admin/structures`
    );
  }
}
