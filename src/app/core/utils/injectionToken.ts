import { HttpContext, HttpContextToken } from '@angular/common/http';

export const CACHING_DISABLED = new HttpContextToken<boolean>(() => false);
export const CLEAR_CACHE = new HttpContextToken<boolean>(() => false);
export const URLS_TO_CLEAR = new HttpContextToken<Set<RegExp>>(() => new Set());

export const NO_CACHE_CONTEXT_OPTIONS = {
  context: new HttpContext().set(CACHING_DISABLED, true),
};

export const CLEAR_CACHE_CONTEXT_OPTIONS = (
  urlsToClear = new Set<string>()
) => ({
  context: new HttpContext()
    .set(CLEAR_CACHE, true)
    .set(
      URLS_TO_CLEAR,
      new Set([...urlsToClear].map((url) => new RegExp(url + '.*')))
    ),
});
