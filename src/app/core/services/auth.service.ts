import { HttpClient } from '@angular/common/http';
import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { LoginDTO } from '@core/types/loginDTO.type';
import { User } from '@core/types/user.type';
import { environment } from '@env/environment';
import { catchError, map, of, tap } from 'rxjs';
import { GroupWithPivot } from '../types/group.type';
import { Unit } from '../types/unit.type';
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
  groups = computed(() => this._userGroups());

  private _userGroups = signal<GroupWithPivot[]>([]);
  private _selectedGroup = signal<GroupWithPivot | null>(null);

  private _userUnits = signal<Unit[]>([]);
  private _groupUnits = computed(() => {
    if (!this.selectedGroup()) {
      return [];
    }
    return this._userUnits().filter(
      unit => unit.group_id == this.selectedGroup()?.id
    );
  });
  private _selectedUnit = linkedSignal<Unit | null>(
    () => this._groupUnits()[0] || null
  );
  selectedUnit = this._selectedUnit.asReadonly();
  setSelectedUnit(unit: Unit | null) {
    this._selectedUnit.set(unit);
  }

  userUnits = this._groupUnits;

  selectedGroup = this._selectedGroup.asReadonly();
  isAuth = this._isAuth.asReadonly();
  isAppAdmin = computed(
    () => JSON.parse(atob(this.jwt()?.split('.')[1] || '{}')).role == 'admin'
  );

  isAdmin = computed(() => {
    if (!this.user()) {
      return false;
    }
    return this.selectedGroup()?.pivot.role == ('admin' as string);
  });

  private api_url = environment.api_url;

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
    const refresh_token = this.getCookie(`${REFRESH_TOKEN_KEY}`);

    if (refresh_token) {
      return http
        .post<LoginDTO>(`${this.api_url}/auth/whoami`, {
          refresh_token,
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

  setSelectGroupById(id: number) {
    this._selectedGroup.set(this._userGroups().find(g => g.id == id)!);
  }

  private processLoginDTO(DTO: LoginDTO) {
    this.user.set(DTO.user);
    this._userGroups.set(DTO.groups);
    this._isAuth.set(true);
    this._selectedGroup.set(DTO.groups[0]);
    this.jwt.set(DTO.token);

    this._userUnits.set(DTO.units);

    this.removeCookie(REFRESH_TOKEN_KEY);
    this.setCookie(REFRESH_TOKEN_KEY, DTO.refresh_token, 14);
  }

  private setCookie(c_name: string, value: string, exdays: number) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value =
      value +
      '; SameSite=Strict; path=/' +
      (exdays == null ? '' : '; expires=' + exdate.toUTCString());

    document.cookie = c_name + '=' + c_value;
  }

  private getCookie(c_name: string) {
    var i,
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
