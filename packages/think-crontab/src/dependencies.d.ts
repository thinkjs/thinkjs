// Only the operations this package uses are declared at these legacy, untyped
// boundaries. They do not become runtime dependencies or public declarations.
declare module 'node-schedule' {
  const schedule: {scheduleJob(rule: unknown, callback: () => void): unknown};
  export = schedule;
}
declare module 'think-mock-http' {
  function mockHttp(args: {method: string; url: unknown}, app: unknown): unknown;
  export = mockHttp;
}
declare module 'debug' {
  function debug(namespace: string): (message: string) => void;
  export = debug;
}
