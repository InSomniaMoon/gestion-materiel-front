import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDTO } from '@core/types/loginDTO.type';
import { User } from '@core/types/user.type';
import { environment } from '@env/environment';
import { catchError, map, of, tap } from 'rxjs';
import { StructureWithRole } from '../types/structure.type';
import { REFRESH_TOKEN_KEY } from '../utils/constants';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  private readonly _isAuth = signal(false);
  jwt = signal<string | null>(null);
  user = signal<User | null>(null);
  structures = computed(() => this._userStructures());

  private readonly _userStructures = signal<StructureWithRole[]>([]);
  private readonly _selectedStructure = signal<StructureWithRole | null>(null);

  selectedStructure = this._selectedStructure.asReadonly();
  isAuth = this._isAuth.asReadonly();
  isAppAdmin = computed(() => {
    const stringjwt = this.jwt()?.split('.')[1];
    if (!stringjwt) {
      return false;
    }
    const jwt = JSON.parse(atob(stringjwt) || '{}');
    return jwt['app_role'] == 'admin';
  });

  isAdmin = computed(() => {
    if (!this.user()) {
      return false;
    }
    return this.selectedStructure()?.role == 'admin';
  });

  private readonly api_url = environment.api_url;

  login({ email, password }: { email: string; password: string }) {
    // This is a fake login function, it should be replaced with a real one
    return this.http
      .post<LoginDTO>(`${this.api_url}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          this.processLoginDTO(res);
        })
      );
  }

  logout() {
    // Remove the token from the local storage
    this.removeCookie(REFRESH_TOKEN_KEY);
    this._isAuth.set(false);
    this.cache.clearAll();
    return true;
  }

  load(http: HttpClient) {
    const refreshToken = this.getCookie(`${REFRESH_TOKEN_KEY}`);

    if (refreshToken) {
      return http
        .post<LoginDTO>(`${this.api_url}/auth/refresh`, {
          refreshToken: refreshToken,
        })
        .pipe(
          map(DTO => {
            this.processLoginDTO(DTO);
            return of(true);
          }),
          catchError(() => {
            this.logout();
            return of(false);
          })
        );
    } else {
      this.logout();
      return of(null);
    }
  }

  resetPassword(dto: {
    password: string;
    token: string;
    password_confirmation: string;
  }) {
    return this.http.post(`${this.api_url}/auth/reset-password`, dto);
  }
  private readonly router = inject(Router);
  setSelectStructureById(id: number) {
    this.http
      .post<LoginDTO>(`${this.api_url}/auth/select-structure/${id}`, {
        refreshToken: this.getCookie(REFRESH_TOKEN_KEY),
      })
      .subscribe({
        next: result => {
          this.cache.clearAll();
          this.jwt.set(result.token);
          const structure = this.structures().find(g => g.id == id)!;
          this._selectedStructure.set(structure);

          if (
            this.router.url.includes('/admin') &&
            structure.role !== 'admin'
          ) {
            this.router.navigateByUrl('/dashboard');
          }
        },
      });
  }

  private processLoginDTO(DTO: LoginDTO) {
    this.user.set(DTO.user);
    this._userStructures.set(DTO.structures);
    this._isAuth.set(true);
    this._selectedStructure.set(DTO.structures[0]);
    this.jwt.set(DTO.token);

    this.removeCookie(REFRESH_TOKEN_KEY);
    this.setCookie(REFRESH_TOKEN_KEY, DTO.refreshToken, 7);
  }

  private setCookie(c_name: string, value: string, exdays: number) {
    let exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    let c_value =
      value +
      '; SameSite=Strict; path=/' +
      (exdays == null ? '' : '; expires=' + exdate.toUTCString());

    document.cookie = c_name + '=' + c_value;
  }

  private getCookie(c_name: string) {
    let i,
      x,
      y,
      ARRcookies = document.cookie.split(';');
    for (i = 0; i < ARRcookies.length; i++) {
      x = ARRcookies[i].substring(0, ARRcookies[i].indexOf('='));
      y = ARRcookies[i].substring(ARRcookies[i].indexOf('=') + 1);
      x = x.replace(/^\s+|\s+$/g, '');
      if (x == c_name) return y;
    }
    return '';
  }

  removeCookie(c_name: string) {
    document.cookie = `${c_name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict;`;
  }
}
