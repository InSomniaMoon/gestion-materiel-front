import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../types/pagination-request.type';
import { queryParams } from '../utils/http.utils';
import { PaginatedData } from '../types/paginatedData.type';
import { User } from '../types/user.type';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly api_url = environment.api_url;

  getPaginatedUsers(
    opt: Partial<PaginationRequest> = {
      page: 1,
      size: 25,
    }
  ) {
    return this.http.get<PaginatedData<User>>(`${this.api_url}/admin/users`, {
      params: queryParams(opt),
    });
  }
}
