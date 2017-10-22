declare module 'thinkjs' {
  interface Controller extends ThinkWebsocket.WebsocketExtend {}
  interface Context extends ThinkWebsocket.WebsocketExtend {}
}

declare namespace ThinkWebsocket {
  interface WebsocketExtend {
    readonly wsData: any;
    readonly websocket: any;
    readonly isWebsocket: boolean;

    emit(event: string, data: any): void;
    broadcast(event: string, data: any): void;
  }
}
export = ThinkWebsocket;