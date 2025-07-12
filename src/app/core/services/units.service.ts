import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';
import { Unit } from '../types/unit.type';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  createUnit(unit: {
    name: string;
    color: string;
    chiefs: number[];
    responsible?: number;
  }) {
    return this.http.post(`${this.api_url}/admin/units`, unit, {
      // Assuming you have a similar cache clearing mechanism as in ItemsService
      ...CLEAR_CACHE_CONTEXT_OPTIONS(),
    });
  }
  private readonly http = inject(HttpClient);
  private api_url = environment.api_url;

  getUnits() {
    return this.http.get<Unit[]>(`${this.api_url}/admin/units`);
  }
}
