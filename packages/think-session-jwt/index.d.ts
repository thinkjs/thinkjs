declare class ThinkSessionJwt {
  constructor(options: object, ctx: object)
  autoSave(): Promise<any>
  get(name: string): Promise<any>
  set(name: string, value): Promise<any>
  delete(): Promise<any>
}

export = ThinkSessionJwt;
