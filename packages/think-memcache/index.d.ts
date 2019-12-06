declare class ThinkMemcache {
  constructor(config?: object)
  get(key: string): Promise<any>
  set(key: string, value: string, expire?: number): Promise<any>
  delete(key: string): Promise<any>
  increase(key: string): Promise<any>
  decrease(key: string): Promise<any>
  close(): Promise<any>
}

export = ThinkMemcache;