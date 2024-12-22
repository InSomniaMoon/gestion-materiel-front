import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, map, of, tap } from 'rxjs';
import { LoginDTO } from '../types/loginDTO.type';
import { User } from '../types/user.type';
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

  isAuth = this._isAuth.asReadonly();

  isAdmin = computed(() => {
    if (!this.user()) {
      return false;
    }
    return this.user()?.role === 'admin';
  });

  login({ email, password }: { email: string; password: string }) {
    // This is a fake login function, it should be replaced with a real one
    return this.http
      .post<LoginDTO>(`${this.api_url}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          this._isAuth.set(true);
          this.user.set(res.user);
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
      return http.get<User>(`${this.api_url}/auth/whoami`).pipe(
        map((DTO) => {
          this.user.set(DTO);
          this._isAuth.set(true);
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
}
