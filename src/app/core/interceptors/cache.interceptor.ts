import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';
import {
  CACHING_DISABLED,
  CLEAR_CACHE,
  URLS_TO_CLEAR,
} from '../utils/injectionToken';

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
      next: event => {
        checkClearCache(req, cacheService);

        if (!(event instanceof HttpResponse)) {
          return;
        }
        if (req.method !== 'GET') {
          return;
        }
        cacheService.set(req.urlWithParams, event.body);
      },
    })
  );
};

const checkClearCache = (
  req: HttpRequest<unknown>,
  cacheService: CacheService
) => {
  if (req.context.get(CLEAR_CACHE)) {
    const exploededUrl = req.url.split('/');

    // check if the last part of the URL is a number (e.g., an ID)
    if (Number.isInteger(+exploededUrl[exploededUrl.length - 1])) {
      exploededUrl.pop(); // remove the last part if it's an ID
    }

    cacheService.clearAll(new RegExp(`${exploededUrl.join('/')}.*`));
    if (!req.context.get(URLS_TO_CLEAR)) {
      return;
    }
    cacheService.clearAll(Array.from(req.context.get(URLS_TO_CLEAR)));
  }
};
