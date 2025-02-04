import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { CACHING_DISABLED, CLEAR_CACHE } from '../utils/injectionToken';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);

  if (req.method !== 'GET') {
    checkClearCache(req, cacheService);
    return next(req);
  }
  if (req.context.get(CACHING_DISABLED)) {
    return next(req);
  }

  const cachedResponse = cacheService.get<any>(req.urlWithParams);

  if (cachedResponse) {
    return of(new HttpResponse({ body: cachedResponse }));
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        checkClearCache(req, cacheService);

        if (!(event instanceof HttpResponse)) {
          return;
        }
        if (req.method !== 'GET') {
          return;
        }
        cacheService.set(req.urlWithParams, event.body);
      },
    }),
  );
};

const checkClearCache = (
  req: HttpRequest<unknown>,
  cacheService: CacheService,
) => {
  if (req.context.get(CLEAR_CACHE)) {
    cacheService.clearAll(new RegExp(`${req.url}.*`));
  }
};
