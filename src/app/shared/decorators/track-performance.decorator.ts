/**
 * Decorator para rastrear performance de métodos
 *
 * Uso:
 * @TrackPerformance('loadProducts')
 * loadProducts(): void { ... }
 */
export function TrackPerformance(metricName?: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const name =
      metricName ||
      `${(target as { constructor: { name: string } }).constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: unknown[]) {
      const startTime = performance.now();

      try {
        const result = originalMethod.apply(this, args);

        // Se for Promise, aguarda conclusão
        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = performance.now() - startTime;
            console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
          });
        }

        const duration = performance.now() - startTime;
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.log(`⏱️ ${name} (error): ${duration.toFixed(2)}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator para memoização (cache de resultados)
 *
 * Uso:
 * @Memoize()
 * expensiveCalculation(n: number): number { ... }
 */
export function Memoize() {
  const cache = new Map<string, unknown>();

  return function (
    _target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const key = JSON.stringify(args);

      if (cache.has(key)) {
        console.log(`📦 Cache hit for ${propertyKey}(${key})`);
        return cache.get(key);
      }

      const result = originalMethod.apply(this, args);
      cache.set(key, result);

      return result;
    };

    return descriptor;
  };
}

/**
 * Decorator para debounce
 *
 * Uso:
 * @Debounce(300)
 * onSearch(term: string): void { ... }
 */
export function Debounce(delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}

/**
 * Decorator para throttle
 *
 * Uso:
 * @Throttle(1000)
 * onScroll(): void { ... }
 */
export function Throttle(delay = 1000) {
  let lastCall = 0;

  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const now = Date.now();

      if (now - lastCall >= delay) {
        lastCall = now;
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}
