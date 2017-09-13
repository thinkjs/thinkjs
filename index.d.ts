
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

  export interface ControllerExtend {
    body: any;
    readonly ip: string;
    readonly ips: string[];
    status: number | string;
    type: string;

    /**
     * get userAgent header
     * @memberOf ControllerExtend
     */
    readonly userAgent: string;
    readonly method: string;
    /**
     * is get request
     * @memberOf ControllerExtend
     */
    readonly isGet: boolean;
    /**
     * is post request
     * @memberOf ControllerExtend
     */
    readonly isPost: boolean;
    /**
     * is command line invoke
     * @memberOf ControllerExtend
     */
    readonly isCli: boolean;

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
     * @memberOf ControllerExtend
     */
    isMethod(method: string): boolean;
    /**
     * is ajax request
     * @memberOf ControllerExtend
     */
    isAjax(method: string): boolean;

    /**
     * is jsonp request
     *  callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf ControllerExtend
     */
    isJsonp(callbackField?: string): boolean;
    /**
     * send jsonp data, callbackField default to this.config('jsonpCallbackField')
     *
     * @memberOf ControllerExtend
     */
    jsonp(data: any, callbackField?: string): any;

    /**
     * send json data
     * @memberOf ControllerExtend
     */
    json(data: any): any;

    /**
     * send success data
     * @memberOf ControllerExtend
     */
    success(data?: string, message?: string): any;

    /**
     * send fail data
     * @memberOf ControllerExtend
     */
    fail(errno: any, errmsg?: string, data?: string): any;
    /**
     * set expires header
     * @memberOf ControllerExtend
     */
    expires(time: any): any

    /**
     * get or set param
     *
     * @memberOf ControllerExtend
     */
    get(name?: string, value?: any): any;
    /**
     * get or set param
     *
     * @memberOf ControllerExtend
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
    post(value: object): ControllerExtend;

    /**
     * get post data, name can be split by comma 'field1,field2' or 'field'
     * @memberOf Controller
     */
    post(name: string): object;


    /**
     *
     * set post value
     * @memberOf ControllerExtend
     */
    post(name: string, value: any): ControllerExtend;
    /**
     * get or set file data
     *
     * @memberOf ControllerExtend
     */
    file(name?: string, value?: any): any;


    /**
     * get this.ctx.header[name]
     * @memberOf ControllerExtend
     */
    header(name: string): Promise<string>;

    /**
     * get or set headere
     * @memberOf ControllerExtend
     */
    header(name?: string, value?: any): any;

    /**
     * this.ctx.set
     *
     * @memberOf ControllerExtend
     */
    header(keyValues: object): any;

    /**
     * get referer header
     * @memberOf ControllerExtend
     */
    referer(onlyHost: boolean): string;
    /**
     * get referer header
     * @memberOf ControllerExtend
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
     * @memberOf ControllerExtend
     */
    controller(name: string, module?: string): Controller;
    /**
     *
     * set param
     *
     * @memberOf ControllerExtend
     */
    param(value: object): ControllerExtend
    /**
     * get query data
     * `query` or `get` is already used in koa
     * @memberOf ControllerExtend
     */
    param(name: string, value: any): ControllerExtend

    /**
     * get service
     *
     * @memberOf ControllerExtend
     */
    service(name: string, module?: string, ...args: any[]): any;


    /**
     * execute action
     *
     * @memberOf ControllerExtend
     */
    action(controller: Controller, actionsName: string, module?: string): Promise<any>;

    /**
     *
     * execute action
     *
     * @memberOf ControllerExtend
     */
    action(controllerName: string, actionsName: string, module?: string): Promise<any>;
    /**
     * download
     * @memberOf ControllerExtend
     */
    download(filepath: string, filename?: string): void;
  }

  export interface ServiceExtend {

  }

  export interface Model {
    new(modelName?: string, config?: object): Model;
    /**
     * get or set db
     */
    db(db?: any): any;
    /**
     * get or set all store models
     */
    models: object;
    /**
     * get table prefix
     */
    readonly tablePrefix: string;
    /**
     * get table name, with table prefix
     */
    readonly tableName: string;
    /**
     * get primary key
     */
    readonly pk: string;
    /**
     * get last sql
     */
    readonly lastSql: string;
    /**
     * get model instance
     */
    model(name: string): Model;
    /**
     * set cache options
     */
    cache(key?: string, config?: object): Model;
    /**
     * set limit options
     */
    limit(offset?: Array<string | number> | number | string, length?: number | string): Model;
    /**
     * set page options
     */
    page(page?: Array<string | number> | number | string, listRows?: string | number): Model;
    /**
     * set where options
     * @return {} []
     */
    where(where?: string | object): Model;
    /**
     * set field options
     */
    field(field?: string, reverse?: boolean): Model;
    /**
     * set field reverse
     */
    fieldReverse(field?: string): Model;
    /**
     * set table name
     */
    table(table?: string, hasPrefix?: boolean): Model;
    /**
     * union options
     */
    union(union?: string, all?: boolean): Model;
    /**
     * join
     */
    join(join?: string | Array<string>): Model;
    /**
     * set order options
     */
    order(value: string): Model;
    /**
     * set table alias
     */
    alias(value: string): Model;
    /**
     * set having options
     */
    having(value: string): Model;
    /**
     * set group options
     */
    group(value: string): Model;
    /**
     * set lock options
     */
    lock(value: string): Model;
    /**
     * set auto options
     */
    auto(value: string): Model;
    /**
     * set distinct options
     */
    distinct(data: any): Model;
    /**
     * set explain
     */
    explain(explain: string): Model;

    /**
     * parse options, reset this.options to {}
     * @param {Object} options
     */
    parseOptions(options: any): Promise<any>;
    /**
     * add data
     */
    add(data: object, options?: object): Promise<string>;

    /**
     * add data when not exist
     * @return {}            []
     */
    thenAdd(data: object, where?: object | string): Promise<object>;

    /**
     * update data when exist, otherwise add data
     * @return {id}
     */
    thenUpdate(data: object, where?: object | string): Promise<object>;

    /**
     * add multi data
     */
    addMany(data: Array<object>, options?: object): Promise<Array<string>>;

    /**
     * delete data
     */
    delete(options?: object): Promise<number>;

    /**
     * update data
     */
    update(data: object, options?: object): Promise<number>;

    /**
     * update all data
     */
    updateMany(dataList: Array<object>, options?: object): Promise<any>;
    /**
     * find data
     */
    find(options?: object): Promise<any>;
    /**
     * select
     */
    select(options?: object): Promise<any>;
    /**
     * select add
     */
    selectAdd(options?: object): Promise<any>;
    /**
     * count select
     */
    countSelect(options?: object, pageFlag?: boolean): Promise<Object>;
    /**
     * get field data
     * if num is ture mean get one value
     */
    getField(field: string, num?: boolean | number): Promise<object>;
    /**
     * increment field data
     */
    increment(field: string, step?: number): Promise<any>;

    /**
     * decrement field data
     * @return {} []
     */
    decrement(field: string, step?: number): Promise<any>;

    /**
     * get count
     */
    count(field: string): Promise<number>;
    /**
     * get sum
     */
    sum(field: string): Promise<number>;
    /**
     * get min value
     */
    min(field: string): Promise<number>;
    /**
     * get max valud
     */
    max(field: string): Promise<number>;
    /**
     * get value average
     */
    avg(field: string): Promise<number>;
    /**
     * query
     */
    query(sqlOptions: object): Promise<any>;
    /**
     * execute sql
     */
    execute(sqlOptions: object): Promise<any>;
    /**
     * parse sql
     */
    parseSql(sqlOptions: object, ...args: Array<any>): object

    /**
     * false means disable all, true means enable all
     */
    setRelation(value: boolean): Model;
    /**
     * set relation
     */
    setRelation(name: string, value?: boolean): Model;
    /**
     * start transaction
     */
    startTrans(): Promise<any>;
    /**
     * commit transcation
     */
    commit(): Promise<any>;
    /**
     * rollback transaction
     */
    rollback(): Promise<any>;
    /**
     * transaction exec functions
     * @param  {Function} fn [async exec function]
     */
    transaction(fn: Function): Promise<any>;
  }

  export interface ModelRelation {
    readonly HAS_ONE: number;
    readonly HAS_MANY: number;
    readonly BELONG_TO: number;
    readonly MANY_TO_MANY: number;
  }

  export interface Context extends ContextExtend, Koa.Context { }


  export interface Controller extends ControllerExtend {
    new(ctx: Context): Controller;

    ctx: Context;
    model(name: string, config?: object, module?: string): any;
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
    new(ctx: Context): Logic;
    validate(rules: Object, msgs?: Object): Object;
    validateErrors?: Object;
  }

  export interface Service {

  }
  export interface Model {

  }

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
    Service: Service;
    Model: Model;
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
