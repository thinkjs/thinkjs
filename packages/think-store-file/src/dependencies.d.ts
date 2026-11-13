// Only the untyped dependency operation used here is declared. The public
// FileStore API does not depend on this transitional declaration.
declare module 'think-debounce' {
  class Debounce {
    debounce<T>(key: string, callback: () => Promise<T>): Promise<T>;
  }
  export = Debounce;
}
