interface ThinkWebsocketCtx {
  readonly data: any;
  readonly wsData: any;
  readonly wsCallback: any;
  readonly websocket: any;
  readonly isWebsocket: boolean;

  emit(event: string, data: any): void;
  broadcast(event: string, data: any): void;
}

declare module 'thinkjs' {
  interface Controller extends ThinkWebsocketCtx {}
  interface Context extends ThinkWebsocketCtx {}
}

declare namespace ThinkWebsocket {
  const controller: ThinkWebsocketCtx
  const context: ThinkWebsocketCtx
}
export = ThinkWebsocket;