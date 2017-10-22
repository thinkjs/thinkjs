declare module 'thinkjs' {
  interface Context extends ThinkSession.SessionExtend {
  }

  interface Controller extends ThinkSession.SessionExtend {
  }
}

declare namespace ThinkSession {
  interface SessionExtend {
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
}

export = ThinkSession;
