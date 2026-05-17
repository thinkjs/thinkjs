interface ThinkI18nCtx {
  getI18n(forceLocale?: string): object;

  /**
   * get current locale
   * @memberOf I18NExtend
   */
  getLocale(): Array<string>;
}

declare module 'thinkjs' {
  interface Controller extends ThinkI18nCtx {}
}

declare namespace ThinkI18N {
  const controller: ThinkI18nCtx
}
export = ThinkI18N;