declare class ThinkSessionRedis {
  constructor(options: object, ctx: object, cookieOptions?: object)
  autoUpdate() : void
  get(name: string): any
  set(name: string, value): void
  delete(): Promise<any>
}

export = ThinkSessionRedis;