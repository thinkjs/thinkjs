// Build-only boundary for the debug factory; no debug types leak into consumers.
declare module 'debug' {
  function createDebug(namespace: string): (message: string) => void;
  export = createDebug;
}
