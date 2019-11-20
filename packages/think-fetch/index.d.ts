interface ThinkFetchCtx {
  /**
   * Stay consistent with window.fetch API.
   * @memberOf FetchExtend
   */
  fetch(url: string, options?: object): Promise<any>;
}
declare module 'thinkjs' {
  interface Think extends ThinkFetchCtx {
  }

  interface Context extends ThinkFetchCtx {
  }

  interface Controller extends ThinkFetchCtx {
  }

  interface Service extends ThinkFetchCtx {
  }
}

declare namespace ThinkFetch {
  const think: ThinkFetchCtx
  const controller: ThinkFetchCtx
  const context: ThinkFetchCtx
  const service: ThinkFetchCtx
}

export = ThinkFetch;
