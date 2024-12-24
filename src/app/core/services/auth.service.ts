import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Group } from '@core/types/group.type';
import { LoginDTO } from '@core/types/loginDTO.type';
import { User } from '@core/types/user.type';
import { environment } from '@env/environment';
import { catchError, map, of, tap } from 'rxjs';
import { UserGroup } from '../types/userGroup.type';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);

  private api_url = environment.api_url;
  private _isAuth = signal(false);

  user = signal<User | null>(null);
  groups = signal<Group[]>([]);

  private _selectedGroup = signal<UserGroup | null>(null);

  selectedGroup = this._selectedGroup.asReadonly();

  isAuth = this._isAuth.asReadonly();

  isAdmin = computed(() => {
    console.log('isAdmin');

    if (!this.user()) {
      return false;
    }
    return this.selectedGroup()?.role == ('admin' as string);
  });

  login({ email, password }: { email: string; password: string }) {
    // This is a fake login function, it should be replaced with a real one
    return this.http
      .post<LoginDTO>(`${this.api_url}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          this.processLoginDTO(res);
        }),
      );
  }

  logout() {
    // Remove the token from the local storage
    localStorage.removeItem('auth_token');
    this._isAuth.set(false);
    this.cache.clearAll();
    return true;
  }

  load(localStorage: Storage, http: HttpClient) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return http.get<LoginDTO>(`${this.api_url}/auth/whoami`).pipe(
        map((DTO) => {
          this.processLoginDTO(DTO);

          return of(true);
        }),
        catchError(() => {
          this._isAuth.set(false);
          localStorage.removeItem('auth_token');
          return of(false);
        }),
      );
    } else {
      this._isAuth.set(false);
      return of(null);
    }
  }

  setSelectedGroup(group: UserGroup) {
    this._selectedGroup.set(group);
  }

  private processLoginDTO(DTO: LoginDTO) {
    this.user.set(DTO.user);
    this.groups.set(DTO.groups.map((group) => group.group!));
    this._isAuth.set(true);
    this._selectedGroup.set(DTO.groups[0]);
  }
}
