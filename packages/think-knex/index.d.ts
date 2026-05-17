import * as Knex from 'knex';

declare module 'thinkjs' {
  interface Think extends ThinkKnex.KnexExtend {}
  interface Context extends ThinkKnex.KnexExtend {}
  interface Controller extends ThinkKnex.KnexExtend {}
  interface Service extends ThinkKnex.KnexExtend {}
}

declare namespace ThinkKnex {
  interface KnexExtend {
    knex(config?: object, module?: string): Knex.Client
  }
}

export = ThinkKnex;