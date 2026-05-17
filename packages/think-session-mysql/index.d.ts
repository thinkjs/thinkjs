declare class ThinkSessionMysql {
  constructor(options: object, ctx: object, cookieOptions?: object)
  autoUpdate(): void
  get(name: string): Promise<any>
  set(name: string, value): Promise<any>
  delete(): Promise<any>
  flush(): Promise<any>
  gc(): any
}

export = ThinkSessionMysql;