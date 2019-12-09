import sequlize from 'sequelize';

declare enum Relation {
  HAS_ONE = 'hasOne',
  BELONG_TO = 'belongsTo',
  HAS_MANY = 'hasMany',
  MANY_TO_MANY = 'belongsToMany'
}

declare interface ThinkSequelize extends sequlize.Model<any, any> {
  new(modelName: string, config: object, name?: string): ThinkSequelize;
  readonly tablePrefix: string
  readonly tableName: string
  readonly models: any

  sequel(modelName: string): ThinkSequelize
  addInstanceMethod(fn: () => any): void

  Sequel: typeof sequlize
  Relation: typeof Relation
}

declare interface ThinkSequelInst {
  Sequel: ThinkSequelize
}

declare interface ThinkSequelMethod {
  sequel(modelName: string, config: object, m?: string):  ThinkSequelize
}

declare module 'thinkjs' {
  interface Think extends ThinkSequelInst, ThinkSequelMethod {}
  interface Controller extends ThinkSequelMethod {}
  interface Context extends ThinkSequelMethod {}
  interface Service extends ThinkSequelMethod {}
}

declare interface IThinkSequelize {
  think: ThinkSequelInst &  ThinkSequelMethod
  controller: ThinkSequelMethod
  context: ThinkSequelMethod
  service: ThinkSequelMethod
}

declare function model(app: object): IThinkSequelize;
export = model