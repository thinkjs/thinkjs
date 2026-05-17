interface ThinkRedisCtx {
  /**
   * get session
   * @memberOf SessionExtend
   */
  session(name: string): Promise<string>;
  /**
   * set session
   * @memberOf SessionExtend
   */
  session(name: string, value: string): Promise<string>;

  /**
   * delete the whole session
   * @memberOf SessionExtend
   */
  session(name: null): Promise<string>;
}

declare module 'thinkjs' {
  interface Context extends ThinkRedisCtx {
  }

  interface Controller extends ThinkRedisCtx {
  }
}

declare namespace ThinkSession {
  const controller: ThinkRedisCtx
  const context: ThinkRedisCtx
}

export = ThinkSession;
