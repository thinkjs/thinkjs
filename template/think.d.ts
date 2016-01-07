// Type definitions for ThinkJS
// Project: https://github.com/75team/thinkjs
// Definitions by: Welefen Lee <https://github.com/welefen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module think {
  /**
   * empty object
   */
  interface EmptyObject {}
  /**
   * defer object
   */
  interface DeferObject {
    resolve(data: any): void;
    reject(err: any): void;
    promise: Promise;
  }
  /**
   * Promise
   */
  interface Promise {}

  interface PreventPromise extends Promise {

  }

  interface StringArray {
    [index: number]: string;
  }

  interface MixedArray {
    [index: number]: any;
  }

  interface HttpObject {
    req: EmptyObject;
    res: EmptyObject
  }
  /**
   * db config
   */
  interface DbConfObject{
    host: string;
    type: string
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
    //(name: string, value: NullType): void;
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
    (name: string, value: any): void;
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
    (req: string | EmptyObject, res?: EmptyObject): Promise;
    base: think_http_base;
  }

  interface think_http_base {
    new(http: HttpObject): think_http_base_instance;
  }

  interface think_http_base_instance extends think_base_instance {
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

  export function uuid(length?: number): string;

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
    ip(): string;
    view(): EmptyObject;
    method(): string;
    isMethod(method: string): boolean;
    isGet(): boolean;
    isPost(): boolean;
    isAjax(method?: string): boolean;
    isWebSocket(): boolean;
    isCli(): boolean;
    isJsonp(name?: string): boolean;
    get(): EmptyObject;
    get(name: string): any;
    get(name: string, value: any): void;
    post(): EmptyObject;
    post(name: string): any;
    post(name: string, value: any): void;
    param(): EmptyObject;
    param(name: string): any;
    file(): EmptyObject;
    file(name: string): EmptyObject;
    file(name: string, value: any): void;
    header(): EmptyObject;
    header(name: string): string;
    header(name: string, value: string): void;
    userAgent(): string;
    referrer(onlyHost?: boolean): string;
    cookie(): EmptyObject;
    cookie(name: string): string;
    cookie(name: string, value: string, options?: any): void;
    session(name: string): Promise;
    session(name: string, value: any): Promise;
    lang(): string;
    lang(lang:string, asViewPath?: boolean): void;
    locale(): EmptyObject;
    locale(key: string, ...data: string[]): string;
    redirect(url?: string, code?: number): PreventPromise;
    fetch(templateFile: string): Promise;
    display(templateFile?: string, charset?: string, contentType?: string): PreventPromise;
    render(templateFile?: string, charset?: string, contentType?: string): PreventPromise;
    jsonp(data: any): PreventPromise;
    json(data: any): PreventPromise;
    status(status?: number): think_controller_base_instance;
    deny(status?: number): PreventPromise;
    expires(time: number): think_controller_base_instance;
    write(obj: any, encoding?: string): void;
    end(obj: any, encoding?: string): PreventPromise;
    send(obj: any, encoding?: string): PreventPromise;
    type(): string;
    type(type: string, encoding?: string): void;
    download(filepath: string, contentType?: string, filename?: string): PreventPromise;
    success(data: any, message?: any): PreventPromise;
    fail(errno?: number | string, errmsg?: string, data?: any): PreventPromise;
    error(errno?: number | string, errmsg?: string, data?: any): PreventPromise;
    sendTime(name: string): void;
    emit(event: string, data: any): void;
    broadcast(event: string, data: any): void;
  }

  interface think_controller_rest {
    new(http: HttpObject): think_controller_rest_instance
  }

  interface think_controller_rest_instance extends think_controller_base_instance{
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

  }

  interface think_model_base_instance extends think_model_$base_instance {

  }

  interface think_model_mongo_instance extends think_model_$base_instance {

  }

  export var model: think_model;


}

declare module thinkData {

}

declare module thinkCache {

}