interface Deferred {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
}
/**
 * Debounce class
 * runs a time-consuming operation. The operation may be called several times concurrently
 * but within think-debounce, it will only be run once before it's finished.
 */
declare class Debounce {
    queues: Record<string, Deferred[]>;
    constructor();
    /**
     * debounce
     * @param {String} key
     * @param {Function} fn
     */
    debounce<T>(key: string, fn: () => T): Promise<Awaited<T>>;
}
export = Debounce;
