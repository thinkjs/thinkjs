// Type definitions for think-cluster in ThinkJs 3.x
// Project: https://thinkjs.org/
// Definitions by: SijieCai <https://github.com/SijieCai>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />
declare namespace ThinkCluster {
  class Messenger extends NodeJS.EventEmitter {
    constructor();
    domain: any;

    /**
     * get one worker
     *
     * @memberOf Messenger
     */
    getWorkers(type: string, cWorker: number): Array<any>;

    /**
     * get all workers
     * @memberOf Messenger
     */
    getWorkers(): Array<any>;

    bindEvent(): any;
    broadcast(action: string, data: any): void;
    /**
     * map worker task, return worker exec result
     * @param {String} action
     */
    map(action: string, mapData: any): Promise<any>;
    runInOnce(callback: Function): void;
    /**
    * run in one worker
    */
    consume(action: string, data?: any): void;
    /**
     * run in one worker
     */
    consume(action: Function, data?: any): void;
  }
}
export = ThinkCluster;

