interface ThinkCacheCtx {
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
  cache(name: string, value?: any, config?: object): Promise<any>;

  /**
   * get cache
   *
   * @memberOf CacheExtend
   */
  cache(name: string, value: Function): Promise<any>;
}

declare module 'thinkjs' {
  interface Think extends ThinkCacheCtx { }
  interface Context extends ThinkCacheCtx { }
  interface Controller extends ThinkCacheCtx { }
}

declare namespace ThinkCache {
  const think: ThinkCacheCtx
  const controller: ThinkCacheCtx
  const context: ThinkCacheCtx
}

export = ThinkCache;
