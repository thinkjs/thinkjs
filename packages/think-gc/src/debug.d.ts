// Build-only boundary for the debug 2.x factory used here. This is not emitted
// or referenced by the public declarations; other debug APIs are not modeled.
declare module 'debug' {
  function createDebug(namespace: string): (message: string) => void;
  export = createDebug;
}
