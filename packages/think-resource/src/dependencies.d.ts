// Build-only declarations for untyped dependencies. These imports are erased
// from the generated public contract; consumers need no ambient Node types.
declare module 'debug' {
  function createDebug(namespace: string): (message: string, ...args: unknown[]) => void;
  export = createDebug;
}

declare module 'koa-send' {
  function send(context: object, path: string, options: object): Promise<string | undefined>;
  export = send;
}
