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
     * @param {any} data []
     */
    resolve(data: any): void;
    /**
     * reject
     * @param {any} err []
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
  interface Promise {
    /**
     * then
     * @param  {Function} fn []
     * @return {Promise}     []
     */
    then(fn: Function): Promise;
    /**
     * catch
     * @param  {Function} fn []
     * @return {Promise}     []
     */
    catch(fn: Function): Promise;
  }

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
  /**
   * http object
   */
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
     * @return {Promise} []
     */
    run(): Promise;
    /**
     * check request has payload data
     * @return {boolean} []
     */
    hasPayload(): boolean;
    /**
     * get payload data
     * @return {Promise} []
     */
    getPayload(): Promise;
    /**
     * parse payload data
     */
    parsePayload(): void;
    /**
     * parse pathname
     * @param  {string} pathname []
     * @return {string}          []
     */
    normalizePathname(pathname: string): string;
    /**
     * get or set config
     * @param  {string} name  []
     * @param  {any}    value []
     * @return {any}          []
     */
    config(name?:string, value?:any): any;
    /**
     * get or set content-type
     * @param  {string} contentType []
     * @param  {string} encoding    []
     * @return {any}                []
     */
    type(contentType?:string, encoding?:string): any;
    /**
     * get userAgent
     * @return {string} []
     */
    userAgent(): string;
    /**
     * get referrer
     * @param  {boolean} host []
     * @return {string}       []
     */
    referrer(host?:boolean): string;
    /**
     * is get request
     * @return {boolean} []
     */
    isGet(): boolean;
    /**
     * is post request
     * @return {boolean} []
     */
    isPost(): boolean;
    /**
     * is ajax request
     * @param  {string}  method []
     * @return {boolean}        []
     */
    isAjax(method?:string): boolean;
    /**
     * is jsonp request
     * @param  {string}  name []
     * @return {boolean}      []
     */
    isJsonp(name?:string): boolean;
    /**
     * get or set get value
     * @param  {string} name  []
     * @param  {any}    value []
     * @return {any}          []
     */
    get(name?:string, value?:any): any;
    /**
     * set or set post value
     * @param  {string} name  []
     * @param  {any}    value []
     * @return {any}          []
     */
    post(name?:string, value?: any): any;
    /**
     * get parameters
     * @param  {string} name []
     * @return {any}         []
     */
    param(name?:string): any;
    /**
     * get or set file 
     * @param  {string}      name  []
     * @param  {EmptyObject} value []
     * @return {any}               []
     */
    file(name?:string, value?: EmptyObject): any;
    /**
     * get or set header
     * @param  {string} name  []
     * @param  {string} value []
     * @return {any}          []
     */
    header(name?:string, value?:string): any;
    /**
     * set status
     * @param  {number} status []
     * @return {any}           []
     */
    status(status?:number): HttpObject;
    /**
     * get user ip
     * @param  {boolean} forward []
     * @return {string}          []
     */
    ip(forward?:boolean): string;
    /**
     * get language
     * @param  {[type]} lang       []
     * @param  {[type]} asViewPath []
     * @return {any}               []
     */
    lang(): string;
    /**
     * set language
     * @param {string}  lang       []
     * @param {boolean} asViewPath []
     */
    lang(lang: string, asViewPath?: boolean): void;
    /**
     * get theme
     * @return {string} []
     */
    theme(): string;
    /**
     * set theme
     * @param {string} theme []
     */
    theme(theme:string): void;
    /**
     * get or set cookie
     * @param  {string}      name    []
     * @param  {string}      value   []
     * @param  {EmptyObject} options []
     * @return {any}                 []
     */
    cookie(name?:string, value?:string, options?:EmptyObject): any;
    /**
     * redirect
     * @param {string} url  []
     * @param {number} code []
     */
    redirect(url?:string, code?:number):void;
    /**
     * send time
     * @param {string} name []
     */
    sendTime(name?:string):void;
    /**
     * send success data
     * @param {any} data    []
     * @param {any} message []
     */
    success(data?:any, message?: any): void;
    /**
     * send fail data
     * @param {string |      number}      errno []
     * @param {string}    errmsg []
     * @param {any}       data   []
     */
    fail(errno?:string | number, errmsg?:string, data?:any): void;
    /**
     * send jsonp data
     * @param {any} data []
     */
    jsonp(data?:any):void;
    /**
     * send json data
     * @param {any} data []
     */
    json(data?:any):void;
    /**
     * get view instance
     * @return {EmptyObject} []
     */
    view(): EmptyObject;
    /**
     * set expires time
     * @param {number} time []
     */
    expires(time:number): void;
    /**
     * locale
     * @param  {MixedArray[]} ...args []
     * @return {any}                  []
     */
    locale(...args: MixedArray[]): any;
    /**
     * get or set session
     * @param  {string}  name  []
     * @param  {any}     value []
     * @return {Promise}       []
     */
    session(name?:string, value?:any): Promise;
    /**
     * write content
     * @param {any}    obj      []
     * @param {string} encoding []
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
     * @param {any}    obj      []
     * @param {string} encoding []
     */
    end(obj?:any, encoding?:string):void;
  }

  /**
   * to fast properties
   * @param {EmptyObject} obj []
   */
  export function toFastProperties(obj: EmptyObject): void;
  /**
   * promisify
   * @param  {any[])   =>       any}         fn []
   * @param  {EmptyObject} recevier []
   * @return {any}                  []
   */
  export function promisify(fn: Function, recevier: any): any;
  /**
   * path seperator
   * @type {string}
   */
  export var sep: string;
  /**
   * is master
   * @type {boolean}
   */
  export var isMaster: boolean;
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

  export function isFileAsync(obj: string): Promise;

  export function isDir(obj: string): boolean;

  export function isDirAsync(obj: string): Promise;

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

  export function datetime(d: any): string;

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
  /**
   * runtime path
   * @type {string}
   */
  export var RUNTIME_PATH: string;

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
     * @param {any[]} ...args []
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
     * @param  {EmptyObject} rules []
     * @param  {EmptyObject} msg   []
     * @return {EmptyObject}       []
     */
    exec(rules: EmptyObject, msg?: EmptyObject): EmptyObject;
    /**
     * get values
     * @param  {EmptyObject} rules []
     * @return {EmptyObject}       []
     */
    values(rules: EmptyObject): EmptyObject;
    /**
     * parse string rule to object
     * @param  {string}      rule []
     * @return {EmptyObject}      []
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
     * @param  {any}         superClass []
     * @param  {EmptyObject} methods    []
     * @return {Function}               []
     */
    create(superClass: any, methods: EmptyObject): Function;

    /**
     * get
     * @param  {string}   name []
     * @return {Function}      []
     */
    get(name: string): Function;

    /**
     * exec
     * @param  {string}     name []
     * @param  {HttpObject} http []
     * @param  {any}        data []
     * @return {Promise}         []
     */
    exec(name: string, http: HttpObject, data?: any): Promise;
    /**
     * think.middleware.base
     * @type {think_middleware_base}
     */
    base: think_middleware_base
  }

  interface think_middleware_base {
    new(http: HttpObject): think_middleware_base_instance
  }

  interface think_middleware_base_instance extends think_http_base_instance {
    /**
     * run
     * @return {any} []
     */
    run(): any;
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
     * [name ]
     * @type {string}
     */
    (name: string, http: HttpObject, data?: any): Promise;
    /**
     * set function
     * @param {[type]}   name []
     * @param {Function} fn   []
     */
    set(name, fn: Function): void;
    /**
     * set array
     * @param {[type]}      name []
     * @param {StringArray} arr  []
     */
    set(name, arr: StringArray): void;
    /**
     * exec
     * @param  {string}     name []
     * @param  {HttpObject} http []
     * @param  {any}        data []
     * @return {Promise}         []
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
     * @param  {any[]}       ...args []
     * @return {EmptyObject}         []
     */
    //parseConfig(...args: any[]): EmptyObject;
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
    (req: string | EmptyObject, res?: EmptyObject | boolean): Promise;
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
     * @param  {string} name []
     * @return {any}         []
     */
    config(name: string): any;
    /**
     * set config
     * @param {string} name  []
     * @param {any}    value []
     */
    config(name: string, value: any): void;
    /**
     * invoke action
     * @param  {string}  controller []
     * @param  {string}  action     []
     * @param  {boolean} transMCA   []
     * @return {Promise}            []
     */
    action(controller: string, action: string, transMCA?: boolean): Promise;
    /**
     * invoke action
     * @param  {think_controller_base} controller []
     * @param  {string}                action     []
     * @param  {boolean}               transMCA   []
     * @return {Promise}                          []
     */
    action(controller: think_controller_base_instance, action: string, transMCA?: boolean): Promise;
    /**
     * get or set cache
     * @param  {string}    key   []
     * @param  {any}       value []
     * @param  {string |     EmptyObject} options []
     * @return {Promise}         []
     */
    cache(key: string, value?: any, options?: string | EmptyObject): Promise;
    /**
     * exec hook
     * @param  {string}  event []
     * @param  {any}     data  []
     * @return {Promise}       []
     */
    hook(event: string, data?: any): Promise;
    /**
     * get model instance
     * @param  {string}           name   []
     * @param  {string        |      EmptyObject} options []
     * @param  {string}           module []
     * @return {think_model_base}        []
     */
    model(name: string, options: string | EmptyObject, module?: string): think_model_base_instance;
    /**
     * get controller instance
     * @param  {string}                name   []
     * @param  {string}                module []
     * @return {think_controller_base}        []
     */
    controller(name: string, module?: string): think_controller_base_instance;
    /**
     * get service
     * @param  {string} name   []
     * @param  {string} module []
     * @return {any}           []
     */
    service(name: string, module?: string): any;
  }

  export var http: think_http;
  /**
   * get uuid
   * @param  {number} length []
   * @return {string}        []
   */
  export function uuid(length?: number): string;

  /**
   * session
   * @param  {HttpObject}  http []
   * @return {EmptyObject}      []
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
     * @return {string} []
     */
    ip(): string;
    /**
     * get view instance
     * @return {EmptyObject} []
     */
    view(): EmptyObject;
    /**
     * get http method
     * @return {string} []
     */
    method(): string;
    /**
     * is method
     * @param  {string}  method []
     * @return {boolean}        []
     */
    isMethod(method: string): boolean;
    /**
     * is get
     * @return {boolean} []
     */
    isGet(): boolean;
    /**
     * is post
     * @return {boolean} []
     */
    isPost(): boolean;
    /**
     * is ajax request
     * @param  {string}  method []
     * @return {boolean}        []
     */
    isAjax(method?: string): boolean;
    /**
     * is websocket request
     * @return {boolean} []
     */
    isWebSocket(): boolean;
    /**
     * is cli env
     * @return {boolean} []
     */
    isCli(): boolean;
    /**
     * is jsonp request
     * @param  {string}  name []
     * @return {boolean}      []
     */
    isJsonp(name?: string): boolean;

    /**
     * get all parameters
     * @return {EmptyObject} []
     */
    get(): EmptyObject;
    /**
     * get one paramter
     * @param  {string} name []
     * @return {any}         []
     */
    get(name: string): any;
    /**
     * set one paramter value
     * @param {string} name  []
     * @param {any}    value []
     */
    get(name: string, value: any): void;
    /**
     * get all post parameters
     * @return {EmptyObject} []
     */
    post(): EmptyObject;
    /**
     * get one post parameter
     * @param  {string} name []
     * @return {any}         []
     */
    post(name: string): any;
    /**
     * set one post parameter
     * @param {string} name  []
     * @param {any}    value []
     */
    post(name: string, value: any): void;
    /**
     * get all parameters
     * @return {EmptyObject} []
     */
    param(): EmptyObject;
    /**
     * get one parameter
     * @param  {string} name []
     * @return {any}         []
     */
    param(name: string): any;
    /**
     * get all upload files
     * @return {EmptyObject} []
     */
    file(): EmptyObject;
    /**
     * get one upload file
     * @param  {string}      name []
     * @return {EmptyObject}      []
     */
    file(name: string): EmptyObject;
    /**
     * set one upload file
     * @param {string} name  []
     * @param {any}    value []
     */
    file(name: string, value: any): void;
    /**
     * get all request headers
     * @return {EmptyObject} []
     */
    header(): EmptyObject;
    /**
     * get one header
     * @param  {string} name []
     * @return {string}      []
     */
    header(name: string): string;
    /**
     * set one header
     * @param {string} name  []
     * @param {string} value []
     */
    header(name: string, value: string): void;
    /**
     * get request userAgent
     * @return {string} []
     */
    userAgent(): string;
    /**
     * get request referrer
     * @param  {boolean} onlyHost []
     * @return {string}           []
     */
    referrer(onlyHost?: boolean): string;
    /**
     * get all cookies
     * @return {EmptyObject} []
     */
    cookie(): EmptyObject;
    /**
     * get one cookie
     * @param  {string} name []
     * @return {string}      []
     */
    cookie(name: string): string;
    /**
     * set one cookie
     * @param {string} name    []
     * @param {string} value   []
     * @param {any}    options []
     */
    cookie(name: string, value: string, options?: any): void;
    /**
     * get session data
     * @param  {string}  name []
     * @return {Promise}      []
     */
    session(name: string): Promise;
    /**
     * set or remove session data
     * @param  {string}  name  []
     * @param  {any}     value []
     * @return {Promise}       []
     */
    session(name: string, value: any): Promise;
    /**
     * get language
     * @return {string} []
     */
    lang(): string;
    /**
     * set language
     * @param {string}  lang       []
     * @param {boolean} asViewPath []
     */
    lang(lang:string, asViewPath?: boolean): void;
    /**
     * get all locales
     * @return {EmptyObject} []
     */
    locale(): EmptyObject;
    /**
     * get one locale
     * @param  {string}   key     []
     * @param  {string[]} ...data []
     * @return {string}           []
     */
    locale(key: string, ...data: string[]): string;
    /**
     * redirect
     * @param  {string}         url  []
     * @param  {number}         code []
     * @return {PreventPromise}      []
     */
    redirect(url?: string, code?: number): PreventPromise;
    /**
     * assign data
     * @param  {string} name  [description]
     * @param  {any}    value [description]
     * @return {any}          [description]
     */
    assign(name: string, value: any): any;
    /**
     * get assign data
     * @param  {string} name [description]
     * @return {any}         [description]
     */
    assign(name: string): any;
    /**
     * get all assign data
     * @return {EmptyObject} [description]
     */
    assign(): EmptyObject;
    /**
     * assign object
     * @param  {EmptyObject} name [description]
     * @return {any}              [description]
     */
    assign(name: EmptyObject): any;
    /**
     * get template content after render
     * @param  {string}  templateFile []
     * @return {Promise}              []
     */
    fetch(templateFile: string, data?: any, config?: any): Promise;
    /**
     * display template file
     * @param  {string}         templateFile []
     * @param  {string}         charset      []
     * @param  {string}         contentType  []
     * @return {PreventPromise}              []
     */
    display(templateFile?: string, charset?: string, contentType?: string): PreventPromise;
    /**
     * render template file
     * @param  {string}         templateFile []
     * @param  {string}         charset      []
     * @param  {string}         contentType  []
     * @return {PreventPromise}              []
     */
    render(templateFile?: string, charset?: string, contentType?: string): PreventPromise;
    /**
     * send jsonp data
     * @param  {any}            data []
     * @return {PreventPromise}      []
     */
    jsonp(data: any): PreventPromise;
    /**
     * send json data
     * @param  {any}            data []
     * @return {PreventPromise}      []
     */
    json(data: any): PreventPromise;
    /**
     * set http status
     * @param  {number}                         status []
     * @return {think_controller_base_instance}        []
     */
    status(status?: number): think_controller_base_instance;
    /**
     * deny request
     * @param  {number}         status []
     * @return {PreventPromise}        []
     */
    deny(status?: number): PreventPromise;
    /**
     * set expires
     * @param  {number}                         time []
     * @return {think_controller_base_instance}      []
     */
    expires(time: number): think_controller_base_instance;
    /**
     * send some content
     * @param {any}    obj      []
     * @param {string} encoding []
     */
    write(obj: any, encoding?: string): void;
    /**
     * end request
     * @param  {any}            obj      []
     * @param  {string}         encoding []
     * @return {PreventPromise}          []
     */
    end(obj: any, encoding?: string): PreventPromise;
    /**
     * send content and end request
     * @param  {any}            obj      []
     * @param  {string}         encoding []
     * @return {PreventPromise}          []
     */
    send(obj: any, encoding?: string): PreventPromise;
    /**
     * get content-type
     * @return {string} []
     */
    type(): string;
    /**
     * set conent-type
     * @param {string} type     []
     * @param {string} encoding []
     */
    type(type: string, encoding?: string): void;
    /**
     * download file
     * @param  {string}         filepath    []
     * @param  {string}         contentType []
     * @param  {string}         filename    []
     * @return {PreventPromise}             []
     */
    download(filepath: string, contentType?: string, filename?: string): PreventPromise;
    /**
     * send success data
     * @param  {any}            data    []
     * @param  {any}            message []
     * @return {PreventPromise}         []
     */
    success(data: any, message?: any): PreventPromise;
    /**
     * send fail data
     * @param  {number      |      string}      errno []
     * @param  {string}         errmsg []
     * @param  {any}            data   []
     * @return {PreventPromise}        []
     */
    fail(errno?: number | string, errmsg?: string, data?: any): PreventPromise;
    /**
     * send fail data, alias fail method
     * @param  {number      |      string}      errno []
     * @param  {string}         errmsg []
     * @param  {any}            data   []
     * @return {PreventPromise}        []
     */
    error(errno?: number | string, errmsg?: string, data?: any): PreventPromise;
    /**
     * send exec time
     * @param {string} name []
     */
    sendTime(name: string): void;
    /**
     * emit event
     * @param {string} event []
     * @param {any}    data  []
     */
    emit(event: string, data: any): void;
    /**
     * boradcast event
     * @param {string} event []
     * @param {any}    data  []
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

    relation: think_model_relation;
  }

  interface think_model_base {
    new(name?: string, config?: EmptyObject): think_model_base_instance;
  }

  interface think_model_mongo {
    new(name?: string, config?: EmptyObject): think_model_mongo_instance;
  }

  interface think_model_relation {
    new(name?: string, config?: EmptyObject): think_model_relation_instance;
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
    /**
     * get table schema
     * @param  {string}  table []
     * @return {Promise}       []
     */
    getSchema(table?:string): Promise;
    /**
     * get unique field in schema
     * @param  {MixedArray[]} data []
     * @return {string}            []
     */
    getUniqueField(data?: MixedArray[]): string;
    /**
     * get last sql
     * @return {string} []
     */
    getLastSql(): string;
    /**
     * get pk
     * @return {Promise} []
     */
    getPk(): Promise;
    /**
     * build sql
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    buildSql(options?:EmptyObject, noParentheses?:boolean): Promise;
    /**
     * parse options
     * @param  {EmptyObject} opt1 []
     * @param  {EmptyObject} opt2 []
     * @return {Promise}          []
     */
    parseOptions(opt1?: EmptyObject, opt2?: EmptyObject): Promise;
    /**
     * parse where options
     * @param  {EmptyObject} options []
     * @return {EmptyObject}         []
     */
    parseWhereOptions(options: EmptyObject): EmptyObject;
    /**
     * parse type
     * @param  {string}      key   []
     * @param  {EmptyObject} value []
     * @return {EmptyObject}       []
     */
    parseType(key: string, value: EmptyObject): EmptyObject;
    /**
     * parse data
     * @param  {EmptyObject} data []
     * @return {EmptyObject}      []
     */
    parseData(data: EmptyObject): EmptyObject;
    /**
     * add data
     * @param  {EmptyObject} data    []
     * @param  {EmptyObject} options []
     * @param  {boolean}     replace []
     * @return {Promise}             []
     */
    add(data: EmptyObject, options?: EmptyObject, replace?:boolean): Promise;
    /**
     * then add
     * @param  {EmptyObject} data   []
     * @param  {[type]}      where? any           []
     * @return {Promise}            []
     */
    thenAdd(data: EmptyObject, where?: any): Promise;
    /**
     * add many
     * @param  {MixedArray}  data    []
     * @param  {EmptyObject} options []
     * @param  {boolean}     replace []
     * @return {Promise}             []
     */
    addMany(data: MixedArray, options?: EmptyObject, replace?: boolean): Promise;
    /**
     * delete
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    delete(options: EmptyObject):Promise;
    /**
     * update data
     * @param  {EmptyObject} data    []
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    update(data: EmptyObject, options?: EmptyObject): Promise;
    /**
     * update many
     * @param  {MixedArray}  data    []
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    updateMany(data: MixedArray, options?: EmptyObject): Promise;
    /**
     * increment field 
     * @param  {string}  field []
     * @param  {number}  step  []
     * @return {Promise}       []
     */
    increment(field: string, step?:number): Promise;
    /**
     * decrement field
     * @param  {string}  field []
     * @param  {number}  step  []
     * @return {Promise}       []
     */
    decrement(field: string, step?:number): Promise;
    /**
     * find data
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    find(options?:EmptyObject): Promise;
    /**
     * select data
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    select(options?:EmptyObject): Promise;
    /**
     * select add
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    selectAdd(options?:EmptyObject): Promise;
    /**
     * count select
     * @param  {EmptyObject} options []
     * @param  {boolean}     flag    []
     * @return {Promise}             []
     */
    countSelect(options?:EmptyObject, flag?:boolean): Promise;
    /**
     * get field data
     * @param  {string}     field []
     * @param  {boolean |     number}      one []
     * @return {Promise}          []
     */
    getField(field:string, one?:boolean | number): Promise;
    /**
     * count
     * @param  {string}  field []
     * @return {Promise}       []
     */
    count(field?:string): Promise;
    /**
     * sum
     * @param  {string}  field []
     * @return {Promise}       []
     */
    sum(field?:string): Promise;
    /**
     * get min value
     * @param  {[type]}  field?string []
     * @return {Promise}              []
     */
    min(field?:string): Promise;
    /**
     * get max value
     * @param  {string}  field []
     * @return {Promise}       []
     */
    max(field?:string): Promise;
    /**
     * get value average
     * @param  {string}  field []
     * @return {Promise}       []
     */
    avg(field?:string): Promise;
    /**
     * query
     * @param  {StringArray[]} ...args []
     * @return {Promise}               []
     */
    query(...args: StringArray[]): Promise;
    /**
     * execute
     * @param  {StringArray[]} ...args []
     * @return {Promise}               []
     */
    execute(...args: StringArray[]): Promise;
    /**
     * parse sql
     * @param  {StringArray[]} ...args []
     * @return {string}                []
     */
    parseSql(...args: StringArray[]): string;
    /**
     * start transactions
     * @return {Promise} []
     */
    startTrans(): Promise;
    /**
     * commit transactions
     * @return {Promise} []
     */
    commit(): Promise;
    /**
     * rollback transactions
     * @return {Promise} []
     */
    rollback(): Promise;
    /**
     * transaction
     * @param  {Function} fn []
     * @return {Promise}     []
     */
    transaction(fn: Function): Promise;
  }

  interface think_model_relation_instance extends think_model_base_instance {
    relation: EmptyObject;
    _relationName: boolean;
    setRelation(name?: any, value?: any): think_model_relation_instance;
  }

  interface think_model_mongo_instance extends think_model_$base_instance {
    /**
     * get pk field
     * @return {Promise} []
     */
    getPk(): Promise;
    /**
     * create indexed
     * @return {Promise} []
     */
    _createIndexes(): Promise;
    /**
     * parse options
     * @param  {EmptyObject} opt1 []
     * @param  {EmptyObject} opt2 []
     * @return {Promise}          []
     */
    parseOptions(opt1?: EmptyObject, opt2?: EmptyObject): Promise;
    /**
     * parse data
     * @param  {any} data []
     * @return {any}      []
     */
    parseData(data: any): any;
    /**
     * get collection
     * @param  {string}      table []
     * @return {EmptyObject}       []
     */
    collection(table?:string): EmptyObject;
    /**
     * add data
     * @param  {EmptyObject} data    []
     * @param  {EmptyObject} options []
     * @param  {boolean}     replace []
     * @return {Promise}             []
     */
    add(data: EmptyObject, options?: EmptyObject, replace?:boolean): Promise;
    /**
     * then add
     * @param  {EmptyObject} data   []
     * @param  {[type]}      where? any           []
     * @return {Promise}            []
     */
    thenAdd(data: EmptyObject, where?: any): Promise;
    /**
     * add many
     * @param  {MixedArray}  data    []
     * @param  {EmptyObject} options []
     * @param  {boolean}     replace []
     * @return {Promise}             []
     */
    addMany(data: MixedArray, options?: EmptyObject, replace?: boolean): Promise;
    /**
     * delete
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    delete(options: EmptyObject):Promise;
    /**
     * update data
     * @param  {EmptyObject} data    []
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    update(data: EmptyObject, options?: EmptyObject): Promise;
    /**
     * update many
     * @param  {MixedArray}  data    []
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    updateMany(data: MixedArray, options?: EmptyObject): Promise;
    /**
     * find
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    find(options?:EmptyObject): Promise;
    /**
     * select data
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    select(options?:EmptyObject): Promise;
    /**
     * select add
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    selectAdd(options?:EmptyObject): Promise;
    /**
     * count select
     * @param  {EmptyObject} options []
     * @param  {boolean}     flag    []
     * @return {Promise}             []
     */
    countSelect(options?:EmptyObject, flag?:boolean): Promise;
     /**
     * increment field 
     * @param  {string}  field []
     * @param  {number}  step  []
     * @return {Promise}       []
     */
    increment(field: string, step?:number): Promise;
    /**
     * decrement field
     * @param  {string}  field []
     * @param  {number}  step  []
     * @return {Promise}       []
     */
    decrement(field: string, step?:number): Promise;
    /**
     * count
     * @param  {string}  field []
     * @return {Promise}       []
     */
    count(field?:string): Promise;
    /**
     * sum
     * @param  {string}  field []
     * @return {Promise}       []
     */
    sum(field?:string): Promise;
    /**
     * aggregate
     * @param  {EmptyObject} options []
     * @return {Promise}             []
     */
    aggregate(options?:EmptyObject): Promise;
    /**
     * map reduce
     * @param  {any}     map    []
     * @param  {any}     resuce []
     * @param  {any}     out    []
     * @return {Promise}        []
     */
    mapReduce(map: any, resuce: any, out: any): Promise;
    /**
     * create index
     * @param  {any}     indexes []
     * @param  {any}     options []
     * @return {Promise}         []
     */
    createIndex(indexes:any, options: any): Promise;
    /**
     * get indexes
     * @return {Promise} []
     */
    getIndexes(): Promise;
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
   * @param  {string}  name    []
   * @param  {any}     value   []
   * @param  {any}     options []
   * @return {Promise}         []
   */
  export function cache(name: string, value?: any, options?: any): Promise;
  /**
   * think.locale
   * @param  {string}   key     []
   * @param  {string[]} ...data []
   * @return {string}           []
   */
  export function locale(key?: string, ...data: string[]): string | EmptyObject;
  /**
   * think.await
   * @param  {string}   key      []
   * @param  {Function} callback []
   * @return {Promise}           []
   */
  export function await(key: string, callback: Function): Promise;
  /**
   * think.npm
   * @param  {string}  package []
   * @return {Promise}         []
   */
  export function npm(pkg: string): Promise;
  /**
   * think.error
   * @param  {string   |     EmptyObject} err []
   * @param  {string}      addOn []
   * @return {EmptyObject}       []
   */
  export function error(err: string | EmptyObject, addOn?: string): ErrorObject;
  /**
   * think.statusAction
   * @param  {number}         status []
   * @param  {HttpObject}     http   []
   * @param  {boolean}        log    []
   * @return {PreventPromise}        []
   */
  export function statusAction(status?: number, http?: HttpObject, log?: boolean): PreventPromise;
  /**
   * think.waterfall
   * @param  {MixedArray} data     []
   * @param  {any}        callback []
   * @return {Promise}             []
   */
  export function waterfall(data: MixedArray, callback: any): Promise;
  /**
   * think.parallelLimit
   * @param  {any}         key      []
   * @param  {any}         data     []
   * @param  {any}         callback []
   * @param  {EmptyObject} options  []
   * @return {Promise}              []
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