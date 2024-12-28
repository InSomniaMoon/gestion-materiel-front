import { HttpContext, HttpContextToken } from '@angular/common/http';

export const CACHING_DISABLED = new HttpContextToken<boolean>(() => false);
export const CLEAR_CACHE = new HttpContextToken<boolean>(() => false);

export const NO_CACHE_CONTEXT_OPTIONS = {
  context: new HttpContext().set(CACHING_DISABLED, true),
};

export const CLEAR_CACHE_CONTEXT_OPTIONS = {
  context: new HttpContext().set(CLEAR_CACHE, true),
};
