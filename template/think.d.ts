// Type definitions for ThinkJS

declare module think {
  /**
   * empty object
   */
  interface EmptyObject {}
  /**
   * The current version of ThinkJS
   * @type {string}
   */
  export var version: string;
  /**
   * to fast properties
   * @param {EmptyObject} obj [description]
   */
  export function toFastProperties(obj: EmptyObject): void;

  //export function promisify(fn: xx, recevier: EmptyObject): any;
  /**
   * path seperator
   * @type {string}
   */
  export var sep: string;
  /**
   * current unix time
   * @type {number}
   */
  export var startTime: number;
  /**
   * dirname
   */
  module dirname {

    export var config: string;

    export var controller: string;

    export var model: string;

    export var adapter: string;

    export var logic: string;

    export var service: string;

    export var view: string;

    export var middleware: string;

    export var runtime: string;

    export var common: string;

    export var bootstrap: string;

    export var locale: string;
  }
  /**
   * env
   * @type {string}
   */
  export var env: string;
  /**
   * server port
   * @type {number}
   */
  export var port: number;
  /**
   * cli args
   * @type {string}
   */
  export var cli: string;
  /**
   * system language
   * @type {string}
   */
  export var lang: string;

  export var mode: number;

  export var mode_normal: number;

  export var mode_module: number;

  export var THINK_LIB_PATH: string;

  export var THINK_PATH: string;
  /**
   * module list
   * @type {Array<string>}
   */
  export var module: Array<string>;



  module adapter {

  } 
}

declare module thinkData {

}

declare module thinkCache {

}