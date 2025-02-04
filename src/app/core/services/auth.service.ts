import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { LoginDTO } from '@core/types/loginDTO.type';
import { User } from '@core/types/user.type';
import { environment } from '@env/environment';
import { catchError, map, of, tap } from 'rxjs';
import { UserGroup } from '../types/userGroup.type';
import { REFRESH_TOKEN_KEY } from '../utils/constants';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);

  private _isAuth = signal(false);
  jwt = signal<string | null>(null);
  user = signal<User | null>(null);
  groups = computed(() => this._userGroups().map((g) => g.group!));

  private _userGroups = signal<UserGroup[]>([]);
  private _selectedGroup = signal<UserGroup | null>(null);
  private _isAppAdmin = signal(false);

  selectedGroup = this._selectedGroup.asReadonly();
  isAuth = this._isAuth.asReadonly();
  isAppAdmin = computed(
    () => JSON.parse(atob(this.jwt()?.split('.')[1] || '{}')).role == 'admin',
  );

  isAdmin = computed(() => {
    if (!this.user()) {
      return false;
    }
    return this.selectedGroup()?.role == ('admin' as string);
  });

  private api_url = environment.api_url;

  login({ email, password }: { email: string; password: string }) {
    // This is a fake login function, it should be replaced with a real one
    return this.http
      .post<LoginDTO>(`${this.api_url}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.processLoginDTO(res);
        }),
      );
  }

  logout() {
    // Remove the token from the local storage
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._isAuth.set(false);
    this.cache.clearAll();
    return true;
  }

  load(localStorage: Storage, http: HttpClient) {
    const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (refresh_token) {
      return http
        .post<LoginDTO>(
          `${this.api_url}/auth/whoami`,
          {
            refresh_token,
          },
          {
            withCredentials: false,
          },
        )
        .pipe(
          map((DTO) => {
            this.processLoginDTO(DTO);
            return of(true);
          }),
          catchError(() => {
            this.logout();
            return of(false);
          }),
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

  setSelectedGroup(group: UserGroup) {
    this._selectedGroup.set(group);
  }

  setSelectGroupById(id: number) {
    this._selectedGroup.set(this._userGroups().find((g) => g.group_id == id)!);
  }

  private processLoginDTO(DTO: LoginDTO) {
    this.user.set(DTO.user);
    this._userGroups.set(DTO.groups);
    this._isAuth.set(true);
    this._selectedGroup.set(DTO.groups[0]);
    this.jwt.set(DTO.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, DTO.refresh_token);
  }
}
