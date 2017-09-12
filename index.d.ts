
import * as Koa from 'koa';
import * as Helper from 'think-helper';
import * as ThinkCluster from 'think-cluster';
import * as ThinkLogger from 'think-logger3';

declare namespace ThinkJs {

  export var think: Think;

  export interface ThinkKoa extends Koa {
    think: Think;
  }

  export interface ContextExtend {
    /**
     * get userAgent header
     * @type {string}
     * @memberOf ContextExtend
     */
    readonly userAgent: string;
    /**
     * is get request
     * @memberOf ContextExtend
     */
    readonly isGet: boolean;
    /**
     * is post request
     * @memberOf ContextExtend
     */
    readonly isPost: boolean;
    /**
     * is command line invoke
     * @memberOf ContextExtend
     */
    readonly isCli: boolean;

    /**
     * get referer header
     * @memberOf ContextExtend
     */
    referer(onlyHost: boolean): string;
    /**
     * get referer header
     * @memberOf ContextExtend
     */
    referrer(onlyHost: boolean): string;
    /**
     * @memberOf ContextExtend
     */
    isMethod(method: string): boolean;
    /**
     * is ajax request
     * @memberOf ContextExtend
     */
    isAjax(method: string): boolean;

    /**
     * is jsonp request
     *  callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf ContextExtend
     */
    isJsonp(callbackField?: string): boolean;

    /**
     * send jsonp data, callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf ContextExtend
     */
    jsonp(data: any, callbackField?: string): any;
    /**
     * send json data
     * @memberOf ContextExtend
     */
    json(data: any): any;
    /**
     * send success data
     * @memberOf ContextExtend
     */
    success(data?: string, message?: string): any;

    /**
     * send fail data
     * @memberOf ContextExtend
     */
    fail(errno: any, errmsg?: string, data?: string): any;
    /**
     * set expires header
     * @memberOf ContextExtend
     */
    expires(time: any): any
    /**
     *
     * get config
     * @memberOf Controller
     */
    config(name: string): Promise<string>;
    /**
     * set config
     * @memberOf Controller
     */
    config(name: string, value: string): Promise<string>;
    /**
     * get or set config
     * @memberOf Controller
     */
    config(name: string, value: string, module: string): Promise<string>;


    /**
     * get param
     *
     * @memberOf ContextExtend
     */
    param(): object;

    /**
     * get param
     * name can be slit by comma 'field1,field2' or 'field'
     *
     * @memberOf ContextExtend
     */
    param(name: string): object;


    /**
     *
     * set param
     *
     * @memberOf ContextExtend
     */
    param(value: object): ContextExtend
    /**
     * get query data
     * `query` or `get` is already used in koa
     * @memberOf Controller
     */
    param(name: string, value: any): ContextExtend
    /**
     * get post data
     * @memberOf Controller
     */
    post(): object;

    /**
     * set post data
     * @memberOf Controller
     */
    post(value: object): ContextExtend;

    /**
     * get post data, name can be split by comma 'field1,field2' or 'field'
     * @memberOf Controller
     */
    post(name: string): object;


    /**
     *
     * set post value
     * @memberOf ContextExtend
     */
    post(name: string, value: any): ContextExtend;


    /**
     * get file data
     *
     * @memberOf ContextExtend
     */
    file(): object;

    /**
     * set file data
     *
     * @memberOf ContextExtend
     */
    file(data: object): ContextExtend;


    /**
     * get file data by name
     * @memberOf ContextExtend
     */
    file(name: string): any;


    /**
     * get file data
     *
     * @memberOf ContextExtend
     */
    file(name: string, value: any): ContextExtend;

    /**
     *
     * get or set cookie, if value is null mean delete the cookie.
     * if value is undefined mean get cookie by name
     *
     * @memberOf Controller
     */
    cookie(name: string, value: string, options?: object): void;


    /**
     * get service
     *
     * @memberOf Controller
     */
    service(name: string, module?: string, ...args: any[]): any;


    /**
     * download
     * @memberOf ContextExtend
     */
    download(filepath: string, filename?: string): void;
  }

  export interface Context extends ContextExtend, Koa.Context {}


  export interface Controller extends ContextExtend {
    new(ctx: Context): Controller;
    __filename: String;
    body: any;
    ip: string;
    ips: string[];
    type: string;
    status: number;
    readonly method: string;

    expires(time: any): void

    /**
     * get controller instance
     *
     * @param {string} name
     * @param {string} [module]
     * @returns {Controller}
     *
     * @memberOf Controller
     */
    controller(name: string, module?: string): Controller;


    /**
     *
     * execute action
     * @param {Controller} controller
     * @param {string} actionsName
     * @param {string} [module]
     * @returns {Promise<any>}
     *
     * @memberOf Controller
     */
    action(controller: Controller, actionsName: string, module?: string): Promise<any>;

    /**
     *
     * execute action
     * @param {string} controllerName
     * @param {string} actionsName
     * @param {string} [module]
     * @returns {Promise<any>}
     *
     * @memberOf Controller
     */
    action(controllerName: string, actionsName: string, module?: string): Promise<any>;


    /**
     * get this.ctx.header[name]
     *
     * @param {string} name
     * @returns {Promise<string>}
     *
     * @memberOf Controller
     */
    header(name: string): Promise<string>;

    /**
     * this.ctx.set(name, value)
     *
     * @param {string} name
     * @param {*} value
     * @returns {*}
     *
     * @memberOf Controller
     */
    header(name: string, value: any): any;

    /**
     * this.ctx.set
     *
     * @param {object} keyValues
     * @returns {*}
     *
     * @memberOf Controller
     */
    header(keyValues: object): any;


    ctx: Context;
    assign?(name: string, value: any): any;
    render?(file: string, config: object): Promise<string>;
    render?(config: object): Promise<string>;
    display?(file: string, config: object): Promise<any>;
    display?(): Promise<any>;
    /**
     * get session
     * @memberOf Controller
     */
    session?(name: string): Promise<string>;
    /**
     * set session
     * @memberOf Controller
     */
    session?(name: string, value: string): Promise<string>;
    session?(name: null): Promise<string>;

  }

  export interface Logic extends Controller {
    validate(rules: Object, msgs?: Object): Object;
    validateErrors?: Object;
  }

  class Service { }
  class Model { }

  export interface Think extends Helper.Think {
    app: ThinkKoa;
    isCli: boolean;
    /**
     * Get thisnk.app.env.
     */
    env: string;
    version: string;
    messenger: ThinkCluster.Messenger;
    Controller: Controller;
    Logic: Logic;
    Service: typeof Service;
    Model: typeof Model;
    ROOT_PATH: string;
    APP_PATH: string;
    logger: ThinkLogger.Logger;

    service(name: string, m: any, ...args: any[]): any;
    beforeStartServer(fn: Function): Promise<any>;
  }
  export class Application {
    constructor(options: {
      ROOT_PATH: string,
      APP_PATH?: string,
      watch?: any,
      transpiler?: any,
      notifier?: Function,
      env?: string
    })
  }
}

export = ThinkJs;
