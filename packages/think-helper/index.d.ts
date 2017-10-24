// Type definitions for think-helper in ThinkJs 3.x
// Project: https://thinkjs.org/
// Definitions by: SijieCai <https://github.com/SijieCai>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped



declare namespace ThinkHelper {
  interface Defer {
    promise: Promise<any>,
    resove: Function,
    reject: Function
  }
  export function camelCase(str: any): any;


  /**
   * change path mode
   *
   * @export
   * @param {string} p
   * @param {string} mode default is '0777'
   * @returns {*}
   */
  export function chmod(p: string, mode?: string): any;

  /**
   * get datetime
   *
   * @export
   * @param {*} date
   * @param {*} format default is 'YYYY-MM-DD HH:mm:ss'
   * @returns {*}
   */
  export function datetime(date: any, format?: string): any;

  /**
   * get deferred object
   *
   * @export
   * @returns {Defer}
   */
  export function defer(): Defer;

  /**
   * escape html
   *
   * @export
   * @param {string} str
   * @returns {string}
   */
  export function escapeHtml(str: string): string;

  export function extend(target: Object, ...args: Object[]): any;


  /**
   *
   * get files in path
   * @export
   * @param {string} dir
   * @param {string} prefix
   * @returns {string}
   */
  export function getdirFiles(dir: string, prefix?: string): Array<string>;

  export function isArray(arg: any): boolean;

  export function isBoolean(arg: any): boolean;

  export function isBuffer(b: any): boolean;

  export function isDate(d: any): boolean;

  export function isDirectory(filePath: any): boolean;

  export function isEmpty(obj: any): boolean;

  export function isError(e: any): boolean;

  export function isExist(dir: any): boolean;

  export function isFile(filePath: any): boolean;

  export function isFunction(arg: any): boolean;

  export function isInt(value: string): boolean;

  export function isIP(value: string): boolean;

  export function isIPv4(value: string): boolean;

  export function isIPv6(value: string): boolean;

  export var isMaster: boolean;

  export function isNull(arg: any): boolean;

  export function isNullOrUndefined(arg: any): boolean;

  export function isNumber(arg: any): boolean;

  export function isNumberString(obj: any): boolean;

  export function isObject(obj: any): boolean;

  export function isPrimitive(arg: any): boolean;

  export function isRegExp(re: any): boolean;

  export function isString(arg: any): boolean;

  export function isSymbol(arg: any): boolean;

  export function isTrueEmpty(obj: any): boolean;

  export function isUndefined(arg: any): boolean;

  export function md5(str: string): string;

  /**
   *
   *
   * @export
   * @param {string} dir
   * @param {string} mode default to '0777'
   * @returns {*}
   */
  export function mkdir(dir: string, mode?: string): any;

  /**
   * transform humanize time to ms
   *
   * @export
   * @param {*} time
   * @returns {*}
   */
  export function ms(time: any): number;


  /**
   * omit some props in object
   *
   * @export
   * @param {Object} obj
   * @param {(string | Array<any>)} props ',' seperate string or array of props
   * @returns {Object}
   */
  export function omit(obj: Object, props: string | Array<any>): Object;


  export function parseAdapterConfig(config: Object, ...extConfig: Array<any>): Object;

  /**
   * make callback function to promise
   *
   * @param  {Function} fn       []
   * @param  {Object}   receiver []
   * @return {Function}            []
   */
  export function promisify(fn: Function, receiver: Object): Function;
  /**
   * remove dir aync
   * @param  {String} p       [path]
   * @param  {Boolean} reserve []
   * @return {Promise}         []
   */
  export function rmdir(p: String, reserve?: Boolean): Promise<any>;

  /**
   * snakeCase string
   * @param  {String} str []
   * @return {String}     []
   */
  export function snakeCase(str: string): string;

  /**
   * get timeout Promise default 1000
   * @param  {Number} time []
   * @return {Promise}      []
   */
  export function timeout(time?: Number): Promise<any>;
  /**
   * generate uuid
   * @param  {String} version [uuid RFC version defautl to v4, or v1]
   * @return {String}         []
   */
  export function uuid(version?: string): string;

  export interface Think {

    camelCase(str: any): any;


    /**
     * change path mode
     *
     * @export
     * @param {string} p
     * @param {string} mode default is '0777'
     * @returns {*}
     */
    chmod(p: string, mode?: string): any;

    /**
     * get datetime
     *
     * @export
     * @param {*} date
     * @param {*} format default is 'YYYY-MM-DD HH:mm:ss'
     * @returns {*}
     */
    datetime(date: any, format?: string): any;

    /**
     * get deferred object
     *
     * @export
     * @returns {Defer}
     */
    defer(): Defer;

    /**
     * escape html
     *
     * @export
     * @param {string} str
     * @returns {string}
     */
    escapeHtml(str: string): string;

    extend(target: Object, ...args: Object[]): any;


    /**
     *
     * get files in path
     * @export
     * @param {string} dir
     * @param {string} prefix
     * @returns {string}
     */
    getdirFiles(dir: string, prefix?: string): Array<string>;

    isArray(arg: any): boolean;

    isBoolean(arg: any): boolean;

    isBuffer(b: any): boolean;

    isDate(d: any): boolean;

    isDirectory(filePath: any): boolean;

    isEmpty(obj: any): boolean;

    isError(e: any): boolean;

    isExist(dir: any): boolean;

    isFile(filePath: any): boolean;

    isFunction(arg: any): boolean;

    isIP(value: string): boolean;

    isIPv4(value: string): boolean;

    isIPv6(value: string): boolean;

    isMaster: boolean;

    isNull(arg: any): boolean;

    isNullOrUndefined(arg: any): boolean;

    isNumber(arg: any): boolean;

    isNumberString(obj: any): boolean;

    isObject(obj: any): boolean;

    isPrimitive(arg: any): boolean;

    isRegExp(re: any): boolean;

    isString(arg: any): boolean;

    isSymbol(arg: any): boolean;

    isTrueEmpty(obj: any): boolean;

    isUndefined(arg: any): boolean;

    md5(str: string): string;

    /**
     *
     *
     * @export
     * @param {string} dir
     * @param {string} mode default to '0777'
     * @returns {*}
     */
    mkdir(dir: string, mode?: string): any;

    /**
     * transform humanize time to ms
     *
     * @export
     * @param {*} time
     * @returns {*}
     */
    ms(time: any): number;


    /**
     * omit some props in object
     *
     * @export
     * @param {Object} obj
     * @param {(string | Array<any>)} props ',' seperate string or array of props
     * @returns {Object}
     */
    omit(obj: Object, props: string | Array<any>): Object;


    parseAdapterConfig(config: Object, ...extConfig: Array<any>): Object;

    /**
     * make callback function to promise
     *
     * @param  {Function} fn       []
     * @param  {Object}   receiver []
     * @return {Function}            []
     */
    promisify(fn: Function, receiver: Object): Function;
    /**
     * remove dir aync
     * @param  {String} p       [path]
     * @param  {Boolean} reserve []
     * @return {Promise}         []
     */
    rmdir(p: String, reserve?: Boolean): Promise<any>;

    /**
     * snakeCase string
     * @param  {String} str []
     * @return {String}     []
     */
    snakeCase(str: string): string;

    /**
     * get timeout Promise default 1000
     * @param  {Number} time []
     * @return {Promise}      []
     */
    timeout(time?: Number): Promise<any>;
    /**
     * generate uuid
     * @param  {String} version [uuid RFC version defautl to v4, or v1]
     * @return {String}         []
     */
    uuid(version?: string): string;

  }
}

export = ThinkHelper;

