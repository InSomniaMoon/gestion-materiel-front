import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { CACHING_DISABLED } from '../utils/injectionToken';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }
  if (req.context.get(CACHING_DISABLED)) {
    return next(req);
  }

  const cacheService = inject(CacheService);
  const cachedResponse = cacheService.get<any>(req.urlWithParams);

  if (cachedResponse) {
    console.log('Cache hit', req.urlWithParams);

    return of(new HttpResponse({ body: cachedResponse }));
  }
  return next(req).pipe(
    tap({
      next: (event) => {
        if (!(event instanceof HttpResponse)) {
          return;
        }
        if (req.method !== 'GET') {
          return;
        }
        console.log('Cache miss', req.urlWithParams);
        cacheService.set(req.urlWithParams, event.body);
      },
    }),
  );
};
