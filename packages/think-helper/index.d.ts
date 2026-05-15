/// <reference types="node" />

export declare function isIP(input: string): number;
export declare function isIPv4(input: string): boolean;
export declare function isIPv6(input: string): boolean;
export declare const isMaster: boolean;

export declare function isArray(object: any): object is Array<any>;
export declare function isBoolean(object: any): object is boolean;
export declare function isNull(object: any): object is null;
export declare function isNullOrUndefined(object: any): object is null | undefined;
export declare function isNumber(object: any): object is number;
export declare function isString(object: any): object is string;
export declare function isSymbol(object: any): object is symbol;
export declare function isUndefined(object: any): object is undefined;
export declare function isRegExp(object: any): object is RegExp;
export declare function isObject(object: any): object is Record<string, any>;
export declare function isDate(object: any): object is Date;
export declare function isError(object: any): object is Error;
export declare function isFunction(object: any): object is Function;
export declare function isPrimitive(object: any): boolean;
export declare function isBuffer(object: any): object is Buffer;
export declare function isInt(value: any): boolean;
export declare function isNumberString(obj: any): boolean;
export declare function isTrueEmpty(obj: any): boolean;
export declare function isEmpty(obj: any): boolean;
export declare function isExist(dir: string): boolean;
export declare function isFile(filePath: string): boolean;
export declare function isDirectory(filePath: string): boolean;

export declare function promisify<T>(fn: Function, receiver?: any): (...args: any[]) => Promise<T>;
export declare function extend<T, U>(target: T, ...sources: U[]): T & U;
export declare function camelCase(str: string): string;
export declare function snakeCase(str: string): string;
export declare function defer<T>(): { promise: Promise<T>; resolve: (value?: T | PromiseLike<T>) => void; reject: (reason?: any) => void; };
export declare function md5(str: string): string;
export declare function timeout(time?: number): Promise<void>;
export declare function escapeHtml(str: string): string;
export declare function datetime(date?: Date | string, format?: string): string;
export declare function uuid(version?: string): string;
export declare function ms(time: number | string): number;
export declare function omit(obj: Record<string, any>, props: string | string[]): Record<string, any>;
export declare function chmod(p: string, mode: string): boolean;
export declare function mkdir(dir: string, mode?: string): boolean;
export declare function getdirFiles(dir: string, prefix?: string): string[];
export declare function rmdir(p: string, reserve?: boolean): Promise<void>;
export declare function parseAdapterConfig(config?: Record<string, any>, ...extConfig: any[]): Record<string, any>;
