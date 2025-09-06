import { Observable, of, from } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface CacheEntry {
  expiry: number;
  value: any;
}

const cacheStore = new Map<string, CacheEntry>();

/**
 * Decorator to cache results of async functions (Promise or Observable).
 * 
 * @param ttlMs - Cache time-to-live in milliseconds. Defaults to environment.cacheTTL.
 */
export function AsyncCacheWithTTL(ttlMs: number = environment.cacheTTL) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
      const now = Date.now();

      // Check cache
      if (cacheStore.has(cacheKey)) {
        const entry = cacheStore.get(cacheKey)!;
        if (now < entry.expiry) {
          return entry.value;
        } else {
          cacheStore.delete(cacheKey); // expired
        }
      }

      const result = originalMethod.apply(this, args);

      // Handle Promises
      if (result instanceof Promise) {
        const wrappedPromise = result.then((res: any) => {
          cacheStore.set(cacheKey, {
            value: Promise.resolve(res),
            expiry: now + ttlMs,
          });
          return res;
        });
        cacheStore.set(cacheKey, { value: wrappedPromise, expiry: now + ttlMs });
        return wrappedPromise;
      }

      // Handle Observables
      if (result instanceof Observable) {
        const shared$ = (result as Observable<any>).pipe(
          tap((res) => {
            cacheStore.set(cacheKey, {
              value: of(res),
              expiry: now + ttlMs,
            });
          }),
          shareReplay(1)
        );
        cacheStore.set(cacheKey, { value: shared$, expiry: now + ttlMs });
        return shared$;
      }

      // Fallback: just return the result (not cached)
      return result;
    };

    return descriptor;
  };
}
