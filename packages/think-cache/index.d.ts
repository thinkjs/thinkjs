declare module 'thinkjs' {
  interface Think extends ThinkCache.CacheExtend { }
  interface Context extends ThinkCache.CacheExtend { }
  interface Controller extends ThinkCache.CacheExtend { }
}

declare namespace ThinkCache {
  interface CacheExtend {

    /**
     * get cache
     *
     * @memberOf CacheExtend
     */
    cache(name: string): Promise<any>;

    /**
     * get or set cache
     * if value is null means delete cache
     * if value is undefined, get cache by name
     * else mean set cache
     * @memberOf CacheExtend
     */
    cache(name: string, value?: string, config?: object): Promise<any>;

    /**
     * get cache
     *
     * @memberOf CacheExtend
     */
    cache(name: string, value: Function): Promise<any>;
  }

}

export = ThinkCache;