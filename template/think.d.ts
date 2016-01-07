// Type definitions for ThinkJS
// Project: https://github.com/75team/thinkjs
// Definitions by: Welefen Lee <https://github.com/welefen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * empty object
 */
interface EmptyObject {}

/**
 * error instance
 */
interface ErrorObject {
  /**
   * error name
   * @type {string}
   */
  name: string;
  /**
   * error message
   * @type {string}
   */
  message: string;
  /**
   * error stack
   * @type {string}
   */
  stack: string;
}

declare module think {
  /**
   * defer object
   */
  interface DeferObject {
    /**
     * resove
     * @param {any} data [description]
     */
    resolve(data: any): void;
    /**
     * reject
     * @param {any} err [description]
     */
    reject(err: any): void;
    /**
     * promise
     * @type {Promise}
     */
    promise: Promise;
  }
  /**
   * Promise
   */
  interface Promise {}

  /**
   * prevent Promise
   */
  interface PreventPromise extends Promise {

  }

  interface StringArray {
    [index: number]: string;
  }

  interface MixedArray {
    [index: number]: any;
  }

  /**
   * db config
   */
  interface DbConfObject{
    host: string;
    type: string
  }

  interface HttpObject {
    /**
     * request
     * @type {EmptyObject}
     */
    req: EmptyObject;
    /**
     * response
     * @type {EmptyObject}
     */
    res: EmptyObject;
    /**
     * error
     * @type {EmptyObject}
     */
    error: ErrorObject;
    /**
     * request start time
     * @type {number}
     */
    startTime: number;
    /**
     * request url
     * @type {string}
     */
    url: string;
    /**
     * http version
     * @type {string}
     */
    version: string;
    /**
     * http method
     * @type {string}
     */
    method: string;
    /**
     * request headers
     * @type {EmptyObject}
     */
    headers: EmptyObject;
    /**
     * host
     * @type {string}
     */
    host: string;
    /**
     * hostname
     * @type {string}
     */
    hostname: string;
    /**
     * request pathname
     * @type {string}
     */
    pathname: string;
    /**
     * query data
     * @type {EmptyObject}
     */
    query: EmptyObject;
    /**
     * file
     * @type {EmptyObject}
     */
    _file: EmptyObject;
    /**
     * post
     * @type {EmptyObject}
     */
    _post: EmptyObject;
    /**
     * cookie
     * @type {EmptyObject}
     */
    _cookie: EmptyObject;
    /**
     * cookie will be send to client
     * @type {EmptyObject}
     */
    _sendCookie: EmptyObject;
    /**
     * get
     * @type {EmptyObject}
     */
    _get: EmptyObject;
    /**
     * content type is sended
     * @type {boolean}
     */
    _contentTypeIsSend: boolean;
    /**
     * is resource request
     * @type {boolean}
     */
    _isResource: boolean;
    /**
     * request is end
     * @type {boolean}
     */
    _isEnd: boolean;
    /**
     * output content promise
     * @type {MixedArray}
     */
    _outputContentPromise: MixedArray;
    /**
     * view instance
     * @type {EmptyObject}
     */
    _view: EmptyObject;
    /**
     * session instance
     * @type {EmptyObject}
     */
    _session: EmptyObject;
    /**
     * request language
     * @type {string}
     */
    _lang: string;
    /**
     * set language to view path
     * @type {boolean}
     */
    _langAsViewPath: boolean;
    /**
     * config
     * @type {EmptyObject}
     */
    _config: EmptyObject;
    /**
     * error object
     * @type {EmptyObject}
     */
    _error: EmptyObject;
    /**
     * theme
     * @type {string}
     */
    _theme: string;
    /**
     * module
     * @type {string}
     */
    module: string;
    /**
     * controller
     * @type {string}
     */
    controller: string;
    /**
     * action
     * @type {string}
     */
    action: string;
    /**
     * post payload
     * @type {string}
     */
    payload: string;
    /**
     * run
     * @return {Promise} [description]
     */
    run(): Promise;
    /**
     * check request has payload data
     * @return {boolean} [description]
     */
    hasPayload(): boolean;
    /**
     * get payload data
     * @return {Promise} [description]
     */
    getPayload(): Promise;
    /**
     * parse payload data
     */
    parsePayload(): void;
    /**
     * parse pathname
     * @param  {string} pathname [description]
     * @return {string}          [description]
     */
    normalizePathname(pathname: string): string;
    /**
     * get or set config
     * @param  {string} name  [description]
     * @param  {any}    value [description]
     * @return {any}          [description]
     */
    config(name?:string, value?:any): any;
    /**
     * get or set content-type
     * @param  {string} contentType [description]
     * @param  {string} encoding    [description]
     * @return {any}                [description]
     */
    type(contentType?:string, encoding?:string): any;
    /**
     * get userAgent
     * @return {string} [description]
     */
    userAgent(): string;
    /**
     * get referrer
     * @param  {boolean} host [description]
     * @return {string}       [description]
     */
    referrer(host?:boolean): string;
    /**
     * is get request
     * @return {boolean} [description]
     */
    isGet(): boolean;
    /**
     * is post request
     * @return {boolean} [description]
     */
    isPost(): boolean;
    /**
     * is ajax request
     * @param  {string}  method [description]
     * @return {boolean}        [description]
     */
    isAjax(method?:string): boolean;
    /**
     * is jsonp request
     * @param  {string}  name [description]
     * @return {boolean}      [description]
     */
    isJsonp(name?:string): boolean;
    /**
     * get or set get value
     * @param  {string} name  [description]
     * @param  {any}    value [description]
     * @return {any}          [description]
     */
    get(name?:string, value?:any): any;
    /**
     * set or set post value
     * @param  {string} name  [description]
     * @param  {any}    value [description]
     * @return {any}          [description]
     */
    post(name?:string, value?: any): any;
    /**
     * get parameters
     * @param  {string} name [description]
     * @return {any}         [description]
     */
    param(name?:string): any;
    /**
     * get or set file 
     * @param  {string}      name  [description]
     * @param  {EmptyObject} value [description]
     * @return {any}               [description]
     */
    file(name?:string, value?: EmptyObject): any;
    /**
     * get or set header
     * @param  {string} name  [description]
     * @param  {string} value [description]
     * @return {any}          [description]
     */
    header(name?:string, value?:string): any;
    /**
     * set status
     * @param  {number} status [description]
     * @return {any}           [description]
     */
    status(status?:number): HttpObject;
    /**
     * get user ip
     * @param  {boolean} forward [description]
     * @return {string}          [description]
     */
    ip(forward?:boolean): string;
    /**
     * get language
     * @param  {[type]} lang       [description]
     * @param  {[type]} asViewPath [description]
     * @return {any}               [description]
     */
    lang(): string;
    /**
     * set language
     * @param {string}  lang       [description]
     * @param {boolean} asViewPath [description]
     */
    lang(lang: string, asViewPath?: boolean): void;
    /**
     * get theme
     * @return {string} [description]
     */
    theme(): string;
    /**
     * set theme
     * @param {string} theme [description]
     */
    theme(theme:string): void;
    /**
     * get or set cookie
     * @param  {string}      name    [description]
     * @param  {string}      value   [description]
     * @param  {EmptyObject} options [description]
     * @return {any}                 [description]
     */
    cookie(name?:string, value?:string, options?:EmptyObject): any;
    /**
     * redirect
     * @param {string} url  [description]
     * @param {number} code [description]
     */
    redirect(url?:string, code?:number):void;
    /**
     * send time
     * @param {string} name [description]
     */
    sendTime(name?:string):void;
    /**
     * send success data
     * @param {any} data    [description]
     * @param {any} message [description]
     */
    success(data?:any, message?: any): void;
    /**
     * send fail data
     * @param {string |      number}      errno [description]
     * @param {string}    errmsg [description]
     * @param {any}       data   [description]
     */
    fail(errno?:string | number, errmsg?:string, data?:any): void;
    /**
     * send jsonp data
     * @param {any} data [description]
     */
    jsonp(data?:any):void;
    /**
     * send json data
     * @param {any} data [description]
     */
    json(data?:any):void;
    /**
     * get view instance
     * @return {EmptyObject} [description]
     */
    view(): EmptyObject;
    /**
     * set expires time
     * @param {number} time [description]
     */
    expires(time:number): void;
    /**
     * locale
     * @param  {MixedArray[]} ...args [description]
     * @return {any}                  [description]
     */
    locale(...args: MixedArray[]): any;
    /**
     * get or set session
     * @param  {string}  name  [description]
     * @param  {any}     value [description]
     * @return {Promise}       [description]
     */
    session(name?:string, value?:any): Promise;
    /**
     * write content
     * @param {any}    obj      [description]
     * @param {string} encoding [description]
     */
    write(obj?:any, encoding?:string): void;
    /**
     * end
     */
    _end():void;
    /**
     * after end
     */
    _afterEnd():void;
    /**
     * end
     * @param {any}    obj      [description]
     * @param {string} encoding [description]
     */
    end(obj?:any, encoding?:string):void;
  }

  /**
   * to fast properties
   * @param {EmptyObject} obj [description]
   */
  export function toFastProperties(obj: EmptyObject): void;
  /**
   * promisify
   * @param  {any[])   =>       any}         fn [description]
   * @param  {EmptyObject} recevier [description]
   * @return {any}                  [description]
   */
  export function promisify(fn: Function, recevier: any): any;
  /**
   * path seperator
   * @type {string}
   */
  export var sep: string;
  /**
   * camel case
   * @param  {string} str []
   * @return {string}     []
   */
  export function camelCase(str: string): string;
  /**
   * defer
   * @return {deferObject} []
   */
  export function defer(): DeferObject;

  export function Class(superCtor: Function, props: EmptyObject): Function;

  export function extend(target: any, ...source: any[]): EmptyObject;

  export function isClass(obj: any): boolean;

  export function isBoolean(obj: any): boolean;

  export function isNumber(obj: any): boolean;

  export function isObject(obj: any): boolean;

  export function isString(obj: any): boolean;

  export function isArray(obj: any): boolean;

  export function isFunction(obj: any): boolean;

  export function isDate(obj: any): boolean;

  export function isRegExp(obj: any): boolean;

  export function isError(obj: any): boolean;

  export function isIP(obj: any): boolean;

  export function isIP4(obj: any): boolean;

  export function isIP6(obj: any): boolean;

  export function isFile(obj: string): boolean;

  export function isDir(obj: string): boolean;

  export function isNumberString(obj: string): boolean;

  export function isPromise(obj: any): boolean;

  export function isWritable(obj: string): boolean;

  export function isBuffer(obj: any): boolean;

  export function isEmpty(obj: any): boolean;

  export function clone(obj: any): any;

  export function mkdir(dir: string): boolean;

  export function rmdir(dir: string): Promise;

  export function md5(str: string): string;

  export function chmod(path: string): boolean;

  export function getFiles(path: string): StringArray;

  export function escapeHtml(str: string): string;

  /**
   * The current version of ThinkJS
   * @type {string}
   */
  export var version: string;
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
  /**
   * root path
   * @type {string}
   */
  export var ROOT_PATH: string;
  /**
   * app path
   * @type {string}
   */
  export var APP_PATH: string;
  /**
   * resource path
   * @type {string}
   */
  export var RESOURCE_PATH: string;

  export function reject(err: any): Promise;

  export function isHttp(obj: any): boolean;

  interface think_base {
    new(...args: any[]): think_base_instance;
  }
  /**
   * think.base instance
   */
  interface think_base_instance {
    /**
     * init
     * @param {any[]} ...args [description]
     */
    init(...args:any[]): void;
    /**
     * invoke
     * @param  {string}  method  []
     * @param  {any[]}   ...data []
     * @return {Promise}         []
     */
    invoke(method: string, ...data: any[]): Promise;
    /**
     * get file basename, without extname
     * @param  {string} filepath []
     * @return {string}          []
     */
    basename(filepath?: string): string;
  }

  export var base: think_base;


  interface think_validate {
    /**
     * register
     * @type {string}
     */
    (name: string, callback: Function): void;
    /**
     * get
     * @type {[type]}
     */
    (name: string): Function;
    /**
     * exec
     * @type {EmptyObject}
     */
    (name: EmptyObject, msg?: EmptyObject): EmptyObject;
    /**
     * exec
     * @param  {EmptyObject} rules [description]
     * @param  {EmptyObject} msg   [description]
     * @return {EmptyObject}       [description]
     */
    exec(rules: EmptyObject, msg?: EmptyObject): EmptyObject;
    /**
     * get values
     * @param  {EmptyObject} rules [description]
     * @return {EmptyObject}       [description]
     */
    values(rules: EmptyObject): EmptyObject;
    /**
     * parse string rule to object
     * @param  {string}      rule [description]
     * @return {EmptyObject}      [description]
     */
    parse(rule: string): EmptyObject;
  }

  export var validate:think_validate;


  interface think_middleware {
    /**
     * register
     * @type {string}
     */
    (name: string, callback: Function): void;
    /**
     * get
     * @type {[type]}
     */
    (name: string): Function;
    /**
     * exec
     * @type {string}
     */
    (name: string, http: HttpObject, data?: any): Promise;

    /**
     * create
     * @param  {any}         superClass [description]
     * @param  {EmptyObject} methods    [description]
     * @return {Function}               [description]
     */
    create(superClass: any, methods: EmptyObject): Function;

    /**
     * get
     * @param  {string}   name [description]
     * @return {Function}      [description]
     */
    get(name: string): Function;

    /**
     * exec
     * @param  {string}     name [description]
     * @param  {HttpObject} http [description]
     * @param  {any}        data [description]
     * @return {Promise}         [description]
     */
    exec(name: string, http: HttpObject, data?: any): Promise;
  }

  export var middleware: think_middleware;


  interface think_hook{
    /**
     * get hook
     * @type {[type]}
     */
    (name: string): StringArray;
    /**
     * hook
     * @type {string}
     */
    (name: string, value: any): void;
    /**
     * [name description]
     * @type {string}
     */
    (name: string, http: HttpObject, data?: any): Promise;
    /**
     * set function
     * @param {[type]}   name [description]
     * @param {Function} fn   [description]
     */
    set(name, fn: Function): void;
    /**
     * set array
     * @param {[type]}      name [description]
     * @param {StringArray} arr  [description]
     */
    set(name, arr: StringArray): void;
    /**
     * exec
     * @param  {string}     name [description]
     * @param  {HttpObject} http [description]
     * @param  {any}        data [description]
     * @return {Promise}         [description]
     */
    exec(name: string, http: HttpObject, data?: any): Promise;
  }

  export var hook: think_hook;


  interface think_route {
    (route: MixedArray): void;
    (route: EmptyObject): void;
    (): MixedArray;
    (): EmptyObject;
  }

  export var route: think_route;


  interface think_config {
    /**
     * set config
     * @type {string}
     */
    (name: string, value: any): void;
    /**
     * get config
     * @type {[type]}
     */
    (name: string): any;
  }

  export var config: think_config;

  export function getModuleConfig(): EmptyObject;

  interface think_co {
    (fn: Function): Promise;
    (obj: any): Promise;
    wrap(fn: Function): Function;
  }

  export var co: think_co;

  export function Class(): Function;

  export function lookClass(name: string, type: string, module?: string, base?: string): any;

  export function getPath(module?: string, type?: string, prefix?: string): string;

  export function require(name: string, flag?: boolean): any;

  export function safeRequire(file: string): any;

  export function parseConfig(...args: any[]): EmptyObject;

  export function prevent(): Promise;

  export function log(str: string | EmptyObject, type?: string, showTime?: boolean | number): void;



  interface think_adapter_base{
    new(...args: any[]): think_adapter_base_instance;
  }

  interface think_adapter_base_instance extends think_base_instance {
    /**
     * parse config
     * @param  {any[]}       ...args [description]
     * @return {EmptyObject}         [description]
     */
    parseConfig(...args: any[]): EmptyObject;
  }

  interface think_adapter {
    (type: string, name: string, fn: Function): void;
    (type: string, name: string, fn: EmptyObject): Function;
    (type: string, name: EmptyObject): Function;
    (type: string, name: string): Function;
    (type: EmptyObject): Function;
    (type: Function, name: EmptyObject): Function;
    base: think_adapter_base
  }

  export var adapter: think_adapter;

  export function loadAdapter(type?: string, base?: string): void;

  export function alias(type: string, paths: StringArray, slash?: boolean): void;

  export function gc(instance: EmptyObject): void;


  interface think_http {
    /**
     * get http
     * @type {[type]}
     */
    (req: string | EmptyObject, res?: EmptyObject): Promise;
    /**
     * think.http.base
     * @type {think_http_base}
     */
    base: think_http_base;
  }

  interface think_http_base {
    new(http: HttpObject): think_http_base_instance;
  }

  interface think_http_base_instance extends think_base_instance {
    /**
     * http object
     * @type {HttpObject}
     */
    http: HttpObject;
    /**
     * get config
     * @param  {string} name [description]
     * @return {any}         [description]
     */
    config(name: string): any;
    /**
     * set config
     * @param {string} name  [description]
     * @param {any}    value [description]
     */
    config(name: string, value: any): void;
    /**
     * invoke action
     * @param  {string}  controller [description]
     * @param  {string}  action     [description]
     * @param  {boolean} transMCA   [description]
     * @return {Promise}            [description]
     */
    action(controller: string, action: string, transMCA?: boolean): Promise;
    /**
     * invoke action
     * @param  {think_controller_base} controller [description]
     * @param  {string}                action     [description]
     * @param  {boolean}               transMCA   [description]
     * @return {Promise}                          [description]
     */
    action(controller: think_controller_base_instance, action: string, transMCA?: boolean): Promise;
    /**
     * get or set cache
     * @param  {string}    key   [description]
     * @param  {any}       value [description]
     * @param  {string |     EmptyObject} options [description]
     * @return {Promise}         [description]
     */
    cache(key: string, value?: any, options?: string | EmptyObject): Promise;
    /**
     * exec hook
     * @param  {string}  event [description]
     * @param  {any}     data  [description]
     * @return {Promise}       [description]
     */
    hook(event: string, data?: any): Promise;
    /**
     * get model instance
     * @param  {string}           name   [description]
     * @param  {string        |      EmptyObject} options [description]
     * @param  {string}           module [description]
     * @return {think_model_base}        [description]
     */
    model(name: string, options: string | EmptyObject, module?: string): think_model_base_instance;
    /**
     * get controller instance
     * @param  {string}                name   [description]
     * @param  {string}                module [description]
     * @return {think_controller_base}        [description]
     */
    controller(name: string, module?: string): think_controller_base_instance;
    /**
     * get service
     * @param  {string} name   [description]
     * @param  {string} module [description]
     * @return {any}           [description]
     */
    service(name: string, module?: string): any;
  }

  export var http: think_http;
  /**
   * get uuid
   * @param  {number} length [description]
   * @return {string}        [description]
   */
  export function uuid(length?: number): string;

  /**
   * session
   * @param  {HttpObject}  http [description]
   * @return {EmptyObject}      [description]
   */
  export function session(http: HttpObject): EmptyObject;

  interface think_controller{
    /**
     * get controller instance
     * @type {string}
     */
    (superClass: string, http: HttpObject): think_controller_base_instance;
    /**
     * get controller instance
     * @type {string}
     */
    (superClass: string, http: any, module: string): think_controller_base_instance;
    /**
     * create controller
     * @type {Function}
     */
    (superClass: Function, methods: EmptyObject): Function;
    /**
     * create controller
     * @type {[type]}
     */
    (superClass: EmptyObject): Function;
    /**
     * think.controller.base class
     * @type {think_controller_base}
     */
    base: think_controller_base;
    /**
     * think.controller.rest class
     * @type {think_controller_rest}
     */
    rest: think_controller_rest;
  }

  interface think_controller_base {
    new(http: HttpObject): think_controller_base_instance
  }

  interface think_controller_base_instance extends think_http_base_instance {
    /**
     * get ip
     * @return {string} [description]
     */
    ip(): string;
    /**
     * get view instance
     * @return {EmptyObject} [description]
     */
    view(): EmptyObject;
    /**
     * get http method
     * @return {string} [description]
     */
    method(): string;
    /**
     * is method
     * @param  {string}  method [description]
     * @return {boolean}        [description]
     */
    isMethod(method: string): boolean;
    /**
     * is get
     * @return {boolean} [description]
     */
    isGet(): boolean;
    /**
     * is post
     * @return {boolean} [description]
     */
    isPost(): boolean;
    /**
     * is ajax request
     * @param  {string}  method [description]
     * @return {boolean}        [description]
     */
    isAjax(method?: string): boolean;
    /**
     * is websocket request
     * @return {boolean} [description]
     */
    isWebSocket(): boolean;
    /**
     * is cli env
     * @return {boolean} [description]
     */
    isCli(): boolean;
    /**
     * is jsonp request
     * @param  {string}  name [description]
     * @return {boolean}      [description]
     */
    isJsonp(name?: string): boolean;
    /**
     * get all parameters
     * @return {EmptyObject} [description]
     */
    get(): EmptyObject;
    /**
     * get one paramter
     * @param  {string} name [description]
     * @return {any}         [description]
     */
    get(name: string): any;
    /**
     * set one paramter value
     * @param {string} name  [description]
     * @param {any}    value [description]
     */
    get(name: string, value: any): void;
    /**
     * get all post parameters
     * @return {EmptyObject} [description]
     */
    post(): EmptyObject;
    /**
     * get one post parameter
     * @param  {string} name [description]
     * @return {any}         [description]
     */
    post(name: string): any;
    /**
     * set one post parameter
     * @param {string} name  [description]
     * @param {any}    value [description]
     */
    post(name: string, value: any): void;
    /**
     * get all parameters
     * @return {EmptyObject} [description]
     */
    param(): EmptyObject;
    /**
     * get one parameter
     * @param  {string} name [description]
     * @return {any}         [description]
     */
    param(name: string): any;
    /**
     * get all upload files
     * @return {EmptyObject} [description]
     */
    file(): EmptyObject;
    /**
     * get one upload file
     * @param  {string}      name [description]
     * @return {EmptyObject}      [description]
     */
    file(name: string): EmptyObject;
    /**
     * set one upload file
     * @param {string} name  [description]
     * @param {any}    value [description]
     */
    file(name: string, value: any): void;
    /**
     * get all request headers
     * @return {EmptyObject} [description]
     */
    header(): EmptyObject;
    /**
     * get one header
     * @param  {string} name [description]
     * @return {string}      [description]
     */
    header(name: string): string;
    /**
     * set one header
     * @param {string} name  [description]
     * @param {string} value [description]
     */
    header(name: string, value: string): void;
    /**
     * get request userAgent
     * @return {string} [description]
     */
    userAgent(): string;
    /**
     * get request referrer
     * @param  {boolean} onlyHost [description]
     * @return {string}           [description]
     */
    referrer(onlyHost?: boolean): string;
    /**
     * get all cookies
     * @return {EmptyObject} [description]
     */
    cookie(): EmptyObject;
    /**
     * get one cookie
     * @param  {string} name [description]
     * @return {string}      [description]
     */
    cookie(name: string): string;
    /**
     * set one cookie
     * @param {string} name    [description]
     * @param {string} value   [description]
     * @param {any}    options [description]
     */
    cookie(name: string, value: string, options?: any): void;
    /**
     * get session data
     * @param  {string}  name [description]
     * @return {Promise}      [description]
     */
    session(name: string): Promise;
    /**
     * set or remove session data
     * @param  {string}  name  [description]
     * @param  {any}     value [description]
     * @return {Promise}       [description]
     */
    session(name: string, value: any): Promise;
    /**
     * get language
     * @return {string} [description]
     */
    lang(): string;
    /**
     * set language
     * @param {string}  lang       [description]
     * @param {boolean} asViewPath [description]
     */
    lang(lang:string, asViewPath?: boolean): void;
    /**
     * get all locales
     * @return {EmptyObject} [description]
     */
    locale(): EmptyObject;
    /**
     * get one locale
     * @param  {string}   key     [description]
     * @param  {string[]} ...data [description]
     * @return {string}           [description]
     */
    locale(key: string, ...data: string[]): string;
    /**
     * redirect
     * @param  {string}         url  [description]
     * @param  {number}         code [description]
     * @return {PreventPromise}      [description]
     */
    redirect(url?: string, code?: number): PreventPromise;
    /**
     * get template content after render
     * @param  {string}  templateFile [description]
     * @return {Promise}              [description]
     */
    fetch(templateFile: string): Promise;
    /**
     * display template file
     * @param  {string}         templateFile [description]
     * @param  {string}         charset      [description]
     * @param  {string}         contentType  [description]
     * @return {PreventPromise}              [description]
     */
    display(templateFile?: string, charset?: string, contentType?: string): PreventPromise;
    /**
     * render template file
     * @param  {string}         templateFile [description]
     * @param  {string}         charset      [description]
     * @param  {string}         contentType  [description]
     * @return {PreventPromise}              [description]
     */
    render(templateFile?: string, charset?: string, contentType?: string): PreventPromise;
    /**
     * send jsonp data
     * @param  {any}            data [description]
     * @return {PreventPromise}      [description]
     */
    jsonp(data: any): PreventPromise;
    /**
     * send json data
     * @param  {any}            data [description]
     * @return {PreventPromise}      [description]
     */
    json(data: any): PreventPromise;
    /**
     * set http status
     * @param  {number}                         status [description]
     * @return {think_controller_base_instance}        [description]
     */
    status(status?: number): think_controller_base_instance;
    /**
     * deny request
     * @param  {number}         status [description]
     * @return {PreventPromise}        [description]
     */
    deny(status?: number): PreventPromise;
    /**
     * set expires
     * @param  {number}                         time [description]
     * @return {think_controller_base_instance}      [description]
     */
    expires(time: number): think_controller_base_instance;
    /**
     * send some content
     * @param {any}    obj      [description]
     * @param {string} encoding [description]
     */
    write(obj: any, encoding?: string): void;
    /**
     * end request
     * @param  {any}            obj      [description]
     * @param  {string}         encoding [description]
     * @return {PreventPromise}          [description]
     */
    end(obj: any, encoding?: string): PreventPromise;
    /**
     * send content and end request
     * @param  {any}            obj      [description]
     * @param  {string}         encoding [description]
     * @return {PreventPromise}          [description]
     */
    send(obj: any, encoding?: string): PreventPromise;
    /**
     * get content-type
     * @return {string} [description]
     */
    type(): string;
    /**
     * set conent-type
     * @param {string} type     [description]
     * @param {string} encoding [description]
     */
    type(type: string, encoding?: string): void;
    /**
     * download file
     * @param  {string}         filepath    [description]
     * @param  {string}         contentType [description]
     * @param  {string}         filename    [description]
     * @return {PreventPromise}             [description]
     */
    download(filepath: string, contentType?: string, filename?: string): PreventPromise;
    /**
     * send success data
     * @param  {any}            data    [description]
     * @param  {any}            message [description]
     * @return {PreventPromise}         [description]
     */
    success(data: any, message?: any): PreventPromise;
    /**
     * send fail data
     * @param  {number      |      string}      errno [description]
     * @param  {string}         errmsg [description]
     * @param  {any}            data   [description]
     * @return {PreventPromise}        [description]
     */
    fail(errno?: number | string, errmsg?: string, data?: any): PreventPromise;
    /**
     * send fail data, alias fail method
     * @param  {number      |      string}      errno [description]
     * @param  {string}         errmsg [description]
     * @param  {any}            data   [description]
     * @return {PreventPromise}        [description]
     */
    error(errno?: number | string, errmsg?: string, data?: any): PreventPromise;
    /**
     * send exec time
     * @param {string} name [description]
     */
    sendTime(name: string): void;
    /**
     * emit event
     * @param {string} event [description]
     * @param {any}    data  [description]
     */
    emit(event: string, data: any): void;
    /**
     * boradcast event
     * @param {string} event [description]
     * @param {any}    data  [description]
     */
    broadcast(event: string, data: any): void;
  }

  interface think_controller_rest {
    new(http: HttpObject): think_controller_rest_instance
  }

  interface think_controller_rest_instance extends think_controller_base_instance {
    _isRest: boolean;
    _method: string;
    modelInstance: think_model_base_instance;
    resource: string;
    id: string;

    getResource(): string;
    getId(): string;
    getAction(): PreventPromise;
    postAction(): PreventPromise;
    putAction(): PreventPromise;
    deleteAction(): PreventPromise;
    __call(): PreventPromise;
  }

  export var controller: think_controller;


  interface think_logic {
    /**
     * get instance
     * @type {string}
     */
    (name: string, http: HttpObject): think_logic_base_instance;
    /**
     * get instance
     * @type {string}
     */
    (name: string, http: any, module: string): think_logic_base_instance;
    /**
     * create logic class
     * @type {[type]}
     */
    (superClass?: any, methods?: EmptyObject): think_logic_base;
    /**
     * think.logic.base class
     * @type {think_logic_base}
     */
    base: think_logic_base;
  }
  interface think_logic_base {
    new(http: HttpObject): think_logic_base_instance;
  }

  interface think_logic_base_instance extends think_controller_base_instance{
    validate(rules?: EmptyObject): boolean;
    errors(): any;
    __after(): any;
  }

  export var logic: think_logic;

  interface think_model {
    /**
     * get model instance
     * @type {string}
     */
    (name: string, config: DbConfObject): think_model_$base_instance;
    /**
     * create model
     * @type {any}
     */
    (name: any, method: EmptyObject): think_model_base | think_model_mongo;
    /**
     * think.model.base class
     * @type {think_model_base}
     */
    base: think_model_base;
    /**
     * think.model.mongo class
     * @type {think_model_mongo}
     */
    mongo: think_model_mongo;
  }

  interface think_model_base {
    new(name?: string, config?: EmptyObject): think_model_base_instance;
  }

  interface think_model_mongo {
    new(name?: string, config?: EmptyObject): think_model_mongo_instance;
  }

  interface think_model_$base_instance extends think_base {
    pk: string;
    name: string;
    tablePrefix: string;
    tableName: string;
    schema: EmptyObject;
    _data: EmptyObject;
    _options: EmptyObject;
    init(name: string, config: EmptyObject): void;
    init(config: EmptyObject): void;
    model(name: string, config?: EmptyObject, module?: string): think_model_$base_instance;
    getTablePrefix(): string;
    db(): EmptyObject;
    getModelName(): string;
    getTableName(): string;
    cache(key: string, timeout?: number): think_model_$base_instance;
    cache(key: EmptyObject): think_model_$base_instance;
    limit(): think_model_$base_instance;
    limit(offset: number, length?: number): think_model_$base_instance;
    page(): think_model_$base_instance;
    page(page: number, listRows?: number): think_model_$base_instance;
    where(): think_model_$base_instance;
    where(where: string | EmptyObject): think_model_$base_instance;
    field(field?: string, reverse?:boolean): think_model_$base_instance;
    fieldReverse(reverse?:boolean): think_model_$base_instance;
    table(table?: string, prefix?:string): think_model_$base_instance;
    union(union?: string, all?: boolean): think_model_$base_instance;
    join(join?: string | EmptyObject): think_model_$base_instance;
    order(order?: string | StringArray): think_model_$base_instance;
    alias(alias?: string): think_model_$base_instance;
    having(having?:string): think_model_$base_instance;
    group(group?:string): think_model_$base_instance;
    lock(lock?:boolean):think_model_$base_instance;
    auto(auto?:any):think_model_$base_instance;
    filter(filter?:any): think_model_$base_instance;
    distinct(distinct?:string): think_model_$base_instance;
    explain(explain?:boolean): think_model_$base_instance;
    optionsFilter(options:EmptyObject): EmptyObject;
    dataFilter(data:any): any;
    beforeAdd(data:any):any;
    afterAdd(data:any):any;
    afterDelete(data: any): any;
    beforeUpdate(data: any): any;
    afterUpdate(data: any): any;
    afterFind(data: any): any;
    afterSelect(data: any): any;
    data(data: any): any;
    options(options: any): any;
    close(): void;
  }

  interface think_model_base_instance extends think_model_$base_instance {

  }

  interface think_model_mongo_instance extends think_model_$base_instance {

  }

  export var model: think_model;

  interface think_service {
    /**
     * get service
     * @type {[type]}
     */
    (superClass: string): any;
    /**
     * create service
     * @type {[type]}
     */
    (): think_service_base;
    /**
     * think.service.base
     * @type {think_service_base}
     */
    base: think_service_base
  }

  interface think_service_base {
    new(): think_service_base_instance;
  }

  interface think_service_base_instance extends think_base_instance {

  }

  export var service: think_service;
  /**
   * think.cache
   * @param  {string}  name    [description]
   * @param  {any}     value   [description]
   * @param  {any}     options [description]
   * @return {Promise}         [description]
   */
  export function cache(name: string, value?: any, options?: any): Promise;
  /**
   * think.locale
   * @param  {string}   key     [description]
   * @param  {string[]} ...data [description]
   * @return {string}           [description]
   */
  export function locale(key?: string, ...data: string[]): string | EmptyObject;
  /**
   * think.await
   * @param  {string}   key      [description]
   * @param  {Function} callback [description]
   * @return {Promise}           [description]
   */
  export function await(key: string, callback: Function): Promise;
  /**
   * think.npm
   * @param  {string}  package [description]
   * @return {Promise}         [description]
   */
  export function npm(pkg: string): Promise;
  /**
   * think.error
   * @param  {string   |     EmptyObject} err [description]
   * @param  {string}      addOn [description]
   * @return {EmptyObject}       [description]
   */
  export function error(err: string | EmptyObject, addOn?: string): ErrorObject;
  /**
   * think.statusAction
   * @param  {number}         status [description]
   * @param  {HttpObject}     http   [description]
   * @param  {boolean}        log    [description]
   * @return {PreventPromise}        [description]
   */
  export function statusAction(status?: number, http?: HttpObject, log?: boolean): PreventPromise;
  /**
   * think.waterfall
   * @param  {MixedArray} data     [description]
   * @param  {any}        callback [description]
   * @return {Promise}             [description]
   */
  export function waterfall(data: MixedArray, callback: any): Promise;
  /**
   * think.parallelLimit
   * @param  {any}         key      [description]
   * @param  {any}         data     [description]
   * @param  {any}         callback [description]
   * @param  {EmptyObject} options  [description]
   * @return {Promise}              [description]
   */
  export function parallelLimit(key?: any, data?: any, callback?: any, options?: EmptyObject): Promise;

}

interface thinkData {
  hook: EmptyObject;
  config: EmptyObject;
  alias: EmptyObject;
  export: EmptyObject;
  route: any;
  middleware: EmptyObject;
  error: EmptyObject;
  template: EmptyObject;
  subController: EmptyObject;
}

declare var thinkData: thinkData;

interface thinkCache {
  (type: string, name: string, value?: any): any;
  MEMORY: string;
  VIEW: string;
  VIEW_CONTENT: string;
  DB: string;
  TABLE: string;
  SESSION: string;
  REDIS: string;
  MEMCACHE: string;
  TIMER: string;
  AUTO_RELOAD: string;
  COLLECTION: string;
  WEBSOCKET: string;
  LIMIT: string;
  APP: string;
}

declare var thinkCache: thinkCache;