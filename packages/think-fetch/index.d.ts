declare module 'thinkjs' {
  interface Think extends ThinkFetch.FetchExtend {
  }

  interface Context extends ThinkFetch.FetchExtend {
  }

  interface Controller extends ThinkFetch.FetchExtend {
  }

  interface Service extends ThinkFetch.FetchExtend {
  }
}

declare namespace ThinkFetch {
  interface FetchExtend {
    /**
     * Stay consistent with window.fetch API.
     * @memberOf FetchExtend
     */
    fetch(url: string, options?: object): Promise<any>;
  }
}

export = ThinkFetch;
