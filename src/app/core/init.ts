import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { lastValueFrom, of } from 'rxjs';
import { AuthService } from './services/auth.service';

export function init(auth$: AuthService, httpClient: HttpClient) {
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    return lastValueFrom(auth$.load(httpClient));
  }
  return lastValueFrom(of(null));
}
