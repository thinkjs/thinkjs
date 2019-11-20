interface ThinkMockCtx {
  mock(target: object, name: string, descriptor: object): object;
}

declare module 'thinkjs' {
  interface Controller extends ThinkMockCtx {}
  interface Service extends ThinkMockCtx {}
}

declare namespace ThinkMock {
  const controller: ThinkMockCtx
  const service: ThinkMockCtx
}

export = ThinkMock;
