
import * as Koa from 'koa';
import * as Helper from 'think-helper';
import * as ThinkCluster from 'think-cluster';
import { Think } from 'thinkjs';

declare module 'thinkjs' {

  export interface Application extends Koa {
    think: Think;
    request: Request;
    response: Response;
  }

  export interface Request extends Koa.Request {
  }

  export interface Response extends Koa.Response {
  }

  interface ThinkCookie {
    /**
     * get cookie
     */
    cookie(name: string): string;

    /**
     * set cookie
     */
    cookie(name: string, value: string, options?: object): void;
    /**
     *
     *  delete cookie
     */
    cookie(name: string, value: null, options?: object): void;
  }
  interface ThinkConfig {
    /**
     * get config
     */
    config(name: string): any;
    /**
     * set config
     */
    config(name: string, value: string): any;
    /**
     * get or set config
     */
    config(name: string, value?: string, module?: string): any;

    /**
     * set config for all modules
     */
    config(name: string, value: string, module: true): any;
  }

  export interface Context extends Koa.Context, ThinkCookie, ThinkConfig {
    request: Request;
    response: Response;
    readonly controller: string;
    readonly action: string;
    /**
     * get userAgent header
     * @memberOf Context
     */
    readonly userAgent: string;
    /**
     * is get request
     * @memberOf Context
     */
    readonly isGet: boolean;
    /**
     * is post request
     * @memberOf Context
     */
    readonly isPost: boolean;
    /**
     * is command line invoke
     * @memberOf Context
     */
    readonly isCli: boolean;
    /**
     * get referer header
     * @memberOf Context
     */
    referer(onlyHost: boolean): string;
    /**
     * get referer header
     * @memberOf Context
     */
    referrer(onlyHost: boolean): string;
    /**
     * @memberOf Context
     */
    isMethod(method: string): boolean;
    /**
     * is ajax request
     * @memberOf Context
     */
    isAjax(method: string): boolean;
    /**
     * is jsonp request
     *  callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf Context
     */
    isJsonp(callbackField?: string): boolean;

    /**
     * send jsonp data, callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf Context
     */
    jsonp(data: any, callbackField?: string): any;
    /**
     * send json data
     * @memberOf Context
     */
    json(data: any): any;
    /**
     * send success data
     * @memberOf Context
     */
    success(data?: object | string, message?: string): any;

    /**
     * send fail data
     * @memberOf Context
     */
    fail(errno: any, errmsg?: string, data?: string): any;
    /**
     * set expires header
     * @memberOf Context
     */
    expires(time: any): any

    /**
     * get param
     *
     * @memberOf Context
     */
    param(): object;

    /**
     * get param
     * name can be slit by comma 'field1,field2' or 'field'
     *
     * @memberOf Context
     */
    param(name: string): object;


    /**
     *
     * set param
     *
     * @memberOf Context
     */
    param(value: object): this
    /**
     * get query data
     * `query` or `get` is already used in koa
     * @memberOf Context
     */
    param(name: string, value: any): this
    /**
     * get post data
     * @memberOf Context
     */
    post(): object;

    /**
     * set post data
     * @memberOf Context
     */
    post(value: object): this;

    /**
     * get post data, name can be split by comma 'field1,field2' or 'field'
     * @memberOf Context
     */
    post(name: string): object;


    /**
     *
     * set post value
     * @memberOf Context
     */
    post(name: string, value: any): this;


    /**
     * get file data
     *
     * @memberOf Context
     */
    file(): object;

    /**
     * set file data
     *
     * @memberOf Context
     */
    file(data: object): this;


    /**
     * get file data by name
     * @memberOf Context
     */
    file(name: string): any;


    /**
     * get file data
     *
     * @memberOf Context
     */
    file(name: string, value: any): this;

    /**
     * get service
     *
     * @memberOf Context
     */
    service(name: string, module?: string, ...args: any[]): any;

    /**
     * download
     * @memberOf Context
     */
    download(filepath: string, filename?: string): void;
  }

  export interface Controller extends ThinkCookie, ThinkConfig {
    
    ctx: Context;
    body: any;
    readonly ip: string;
    readonly ips: string[];
    status: number | string;
    type: string;

    /**
     * get userAgent header
     * @memberOf Controller
     */
    readonly userAgent: string;
    readonly method: string;
    /**
     * is get request
     * @memberOf Controller
     */
    readonly isGet: boolean;
    /**
     * is post request
     * @memberOf Controller
     */
    readonly isPost: boolean;
    /**
     * is command line invoke
     * @memberOf Controller
     */
    readonly isCli: boolean;
    /**
     * @memberOf Controller
     */
    isMethod(method: string): boolean;
    /**
     * is ajax request
     * @memberOf Controller
     */
    isAjax(method: string): boolean;

    /**
     * is jsonp request
     *  callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf Controller
     */
    isJsonp(callbackField?: string): boolean;
    /**
     * send jsonp data, callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf Controller
     */
    jsonp(data: any, callbackField?: string): any;

    /**
     * send json data
     * @memberOf Controller
     */
    json(data: any): any;

    /**
     * send success data
     * @memberOf Controller
     */
    success(data?: object | string, message?: string): any;

    /**
     * send fail data
     * @memberOf Controller
     */
    fail(errno: any, errmsg?: string, data?: string): any;
    /**
     * set expires header
     * @memberOf Controller
     */
    expires(time: any): any

    /**
     * get or set param
     *
     * @memberOf Controller
     */
    get(name?: string, value?: any): any;
    /**
     * get or set param
     *
     * @memberOf Controller
     */
    query(name?: string, value?: any): any;

    /**
    * get post data
    * @memberOf Controller
    */
    post(): object;

    /**
     * set post data
     * @memberOf Controller
     */
    post(value: object): this;

    /**
     * get post data, name can be split by comma 'field1,field2' or 'field'
     * @memberOf Controller
     */
    post(name: string): object;


    /**
     *
     * set post value
     * @memberOf Controller
     */
    post(name: string, value: any): this;
    /**
     * get or set file data
     *
     * @memberOf Controller
     */
    file(name?: string, value?: any): any;


    /**
     * get this.ctx.header[name]
     * @memberOf Controller
     */
    header(name: string): Promise<string>;

    /**
     * get or set headere
     * @memberOf Controller
     */
    header(name?: string, value?: any): any;

    /**
     * this.ctx.set
     *
     * @memberOf Controller
     */
    header(keyValues: object): any;

    /**
     * get referer header
     * @memberOf Controller
     */
    referer(onlyHost: boolean): string;
    /**
     * get referer header
     * @memberOf Controller
     */
    referrer(onlyHost: boolean): string;
    /**
    * Perform a 302 redirect to `url`.
    *
    * The string "back" is special-cased
    * to provide Referrer support, when Referrer
    * is not present `alt` or "/" is used.
    *
    * Examples:
    *
    *    this.redirect('back');
    *    this.redirect('back', '/index.html');
    *    this.redirect('/login');
    *    this.redirect('http://google.com');
    */
    redirect(url: string, alt?: string): void;

    /**
     * get controller instance
     * @memberOf Controller
     */
    controller(name: string, module?: string): this;
    /**
     *
     * set param
     *
     * @memberOf Controller
     */
    param(value: object): this
    /**
     * get query data
     * `query` or `get` is already used in koa
     * @memberOf Controller
     */
    param(name: string, value: any): this

    /**
     * get service
     *
     * @memberOf Controller
     */
    service(name: string, module?: string, ...args: any[]): any;


    /**
     * execute action
     *
     * @memberOf Controller
     */
    action(controller: this, actionsName: string, module?: string): Promise<any>;

    /**
     *
     * execute action
     *
     * @memberOf Controller
     */
    action(controllerName: string, actionsName: string, module?: string): Promise<any>;
    /**
     * download
     * @memberOf Controller
     */
    download(filepath: string, filename?: string): void;
  }

  export interface TController extends Controller {
    new(ctx: Context): Controller;
  }

  export interface Service {
    new(): Service;
  }

  export interface Logger {
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
  }

  export interface Logic extends Controller {
    new(): Logic;
    validate(rules: Object, msgs?: Object): Object;
    validateErrors?: Object;
    allowMethods: string;
  }

  export interface Think extends Helper.Think, ThinkConfig {
    app: Application;
    isCli: boolean;
    /**
     * Get thisnk.app.env.
     */
    env: string;
    version: string;
    messenger: ThinkCluster.Messenger;
    ROOT_PATH: string;
    APP_PATH: string;
    logger: Logger;

    Controller: TController;
    Logic: Logic;
    Service: Service;

    service(name: string): any;
    service(name: string, ...args: any[]): any;
    service(name: string, m: any, ...args: any[]): any;
    beforeStartServer(fn: Function): Promise<any>;
  }
}

declare namespace ThinkJS {
  export var think: Think;
}

export = ThinkJS;
