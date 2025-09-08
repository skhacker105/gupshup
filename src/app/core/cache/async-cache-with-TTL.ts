import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface CacheEntry {
  expiry: number;
  value: any;
}

const cacheStore = new Map<string, CacheEntry>();
const methodCacheKeys = new Map<string, Set<string>>();

/**
 * Cacheable decorator for async functions (Promise or Observable).
 * Stores results with a TTL.
 */
export function Cacheable(ttlMs: number = environment.cacheTTL) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
      const now = Date.now();

      // Register this key under the method name
      if (!methodCacheKeys.has(propertyKey)) {
        methodCacheKeys.set(propertyKey, new Set());
      }
      methodCacheKeys.get(propertyKey)!.add(cacheKey);

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

      // Handle Promise
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

      // Handle Observable
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

      return result; // fallback
    };

    return descriptor;
  };
}

/**
 * CacheEvict decorator for methods that should clear caches of related methods.
 * 
 * @param methods - Array of method names whose cache should be cleared
 */
export function CacheEvict(methods: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Invalidate caches of specified methods
      methods.forEach((method) => {
        const keys = methodCacheKeys.get(method);
        if (keys) {
          keys.forEach((key) => cacheStore.delete(key));
          methodCacheKeys.delete(method);
        }
      });

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
