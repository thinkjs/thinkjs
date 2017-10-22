declare module 'thinkjs' {
  interface Controller {
    getI18n(forceLocale?: string): object;

    /**
     * get current locale
     * @memberOf I18NExtend
     */
    getLocale(): Array<string>;
  }
}

declare namespace ThinkI18N {}
export = ThinkI18N;