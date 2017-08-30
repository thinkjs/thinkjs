// Type definitions for think-cluster in ThinkJs 3.x
// Project: https://thinkjs.org/
// Definitions by: SijieCai <https://github.com/SijieCai>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace ThinkLogger {
  export class Messenger {
    domain: any;

    addListener(type: any, listener: any): any;

    bindEvent(...args: any[]): void;

    broadcast(...args: any[]): void;

    emit(type: any, ...args: any[]): any;

    eventNames(): any;

    getMaxListeners(): any;

    getWorkers(...args: any[]): void;

    listenerCount(type: any): any;

    listeners(type: any): any;

    on(type: any, listener: any): any;

    once(type: any, listener: any): any;

    prependListener(type: any, listener: any): any;

    prependOnceListener(type: any, listener: any): any;

    removeAllListeners(type: any, ...args: any[]): any;

    removeListener(type: any, listener: any): any;

    runInOne(...args: any[]): void;

    setMaxListeners(n: any): any;

    setTimeout(...args: any[]): void;



  }
}
export = ThinkLogger;

