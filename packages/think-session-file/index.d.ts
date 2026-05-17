declare class ThinkSessionFile {
  constructor(options: object, ctx: object, cookieOptions?: object)
  autoUpdate(): void
  get(name: string): Promise<any>
  set(name: string, value: any): Promise<any>
  delete(): Promise<any>
  flush(): Promise<any>
  gc(): void
}

export = ThinkSessionFile;