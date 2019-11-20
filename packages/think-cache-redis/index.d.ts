declare class ThinkCacheRedis {
  constructor(config?: object)
  get(key: string): any
  set(key: string, content: any, timeout?: number): any
  delete(key: string): any
}

export = ThinkCacheRedis;