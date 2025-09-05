import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { tap } from 'rxjs';
import { Unit } from '../types/unit.type';
import { CLEAR_CACHE_CONTEXT_OPTIONS } from '../utils/injectionToken';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private api_url = environment.api_url;

  getUnits() {
    return this.http.get<Unit[]>(`${this.api_url}/admin/units`);
  }

  createUnit(unit: {
    name: string;
    color: string;
    chiefs: number[];
    responsible?: number;
  }) {
    return this.http.post(
      `${this.api_url}/admin/units`,
      unit,
      CLEAR_CACHE_CONTEXT_OPTIONS()
    );
  }

  updateUnit(
    id: number,
    unit: {
      name?: string;
      color?: string;
      chiefs?: number[];
      responsible?: number;
    }
  ) {
    return this.http
      .patch(
        `${this.api_url}/admin/units/${id}`,
        unit,
        CLEAR_CACHE_CONTEXT_OPTIONS()
      )
      .pipe(
        tap(() => {
          this.cache.clear(`${this.api_url}/admin/units`);
        })
      );
  }
}
