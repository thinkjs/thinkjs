interface Deferred {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

/**
 * Debounce class
 * runs a time-consuming operation. The operation may be called several times concurrently
 * but within think-debounce, it will only be run once before it's finished.
 */
class Debounce {
  queues: Record<string, Deferred[]>;
  constructor() {
    this.queues = {};
  }
  /**
   * debounce
   * @param {String} key
   * @param {Function} fn
   */
  debounce<T>(key: string, fn: () => T): Promise<Awaited<T>> {
    if (!(key in this.queues)) {
      this.queues[key] = [];
      return Promise.resolve().then(() => {
        return fn();
      }).then(data => {
        process.nextTick(() => {
          this.queues[key].forEach(deferred => deferred.resolve(data));
          delete this.queues[key];
        });
        return data;
      }).catch(err => {
        process.nextTick(() => {
          this.queues[key].forEach(deferred => deferred.reject(err));
          delete this.queues[key];
        });
        return Promise.reject(err);
      }) as Promise<Awaited<T>>; // Native promises recursively unwrap callback results.
    } else {
      return new Promise<Awaited<T>>((resolve, reject) => {
        this.queues[key].push({
          // A shared key must represent the same operation/result type.
          // The heterogeneous queue erases T; restore it only at this boundary.
          resolve: value => resolve(value as Awaited<T>),
          reject
        });
      });
    }
  }
}

export = Debounce;
