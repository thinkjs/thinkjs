import type { ModelCall, ThinkModels, ContextModels, ControllerModels } from 'think-model/model-types';

class Base { where(value: object): this { return this; } }
class Shared extends Base { commonOnly = true; }
class Local extends Base { localOnly = 42; }
class Nested extends Base { nestedOnly = 'nested'; constructor(public name: string, public config: object) { super(); } }
class InvalidArgument extends Base { constructor(count: number) { super(); } }
class InvalidConfig extends Base { constructor(name: string, config: number) { super(); } }
class InvalidArity extends Base { constructor(name: string, config: object, extra: boolean) { super(); } }
class NotModel { unrelated = true; }
declare module 'think-model/model-types' {
  interface ModelModules {
    __single__: {shared: typeof Shared; 'nested/item': typeof Nested};
    common: {
      shared: typeof Shared; inherited: typeof Nested;
      object: {method(): void}; arrow: () => Base;
      config: typeof InvalidConfig; argument: typeof InvalidArgument; arity: typeof InvalidArity; unrelated: typeof NotModel;
    };
    admin: {shared: typeof Local};
    empty: {};
    own: {constructor: typeof Shared; toString: typeof Nested; mixed: typeof Shared | {invalid: true}};
  }
}
declare const single: ModelCall<Base>;
declare const global: ModelCall<Base, 'multi'>;
declare const ctx: ModelCall<Base, 'multi', 'admin'>;
declare const unbound: ModelCall<Base, 'multi', string>;
declare const mixed: ModelCall<Base, 'multi', 'common' | 'admin'>;
const a: boolean = single('shared', 'adapter', 'ignored').commonOnly;
const b: string = single('nested/item', {}, 'admin').nestedOnly;
const c: boolean = global('shared').commonOnly;
const d: number = ctx('shared').localOnly;
const e: number = ctx('shared', undefined, undefined).localOnly;
const f: boolean = ctx('shared', null, 'common').commonOnly;
const g: string = ctx('inherited').nestedOnly;
const h: string = global('inherited', undefined, 'empty').nestedOnly;
const table: Base = ctx('unregistered_table').where({id: 1});
const absent: Base = global('shared', undefined, 'unregistered_module');
const blank: Base = global('shared', undefined, '');
const configNotModule: boolean = global('shared', 'admin').commonOnly;
declare const name: 'shared' | 'inherited';
const names: Shared | Nested = global(name);
declare const module: 'common' | 'admin';
const modules: Shared | Local = global('shared', undefined, module);
declare const maybeModule: 'admin' | undefined;
const maybe: Shared | Local = global('shared', undefined, maybeModule);
const current: Shared | Local = mixed('shared');
const uncertain: Base = unbound('shared');
declare const wide: string;
// @ts-expect-error arbitrary names may hit inherited Object.prototype constructors
const wideName = global(wide);
const wideModule: Base = global('shared', undefined, wide);
// @ts-expect-error known objects are not constructible; no unknown-table escape
global('object');
// @ts-expect-error arrow functions cannot be constructed
global('arrow');
// @ts-expect-error the name passed to constructors is a string
global('argument');
// @ts-expect-error constructors cannot require a third argument
global('arity');
// @ts-expect-error a registered model must implement the base ORM instance contract
global('unrelated');
// @ts-expect-error inherited invalid exports remain invalid in local modules
ctx('object');
// Unknown modules do not load invalid common exports, and still permit fallback.
global('object', undefined, 'missing').where({});
// @ts-expect-error global lookup defaults to common
global('shared').localOnly;
// @ts-expect-error context lookup defaults to admin
ctx('shared').commonOnly;
// @ts-expect-error unknown table returns base, not any
ctx('not_registered').missingMethod();
// @ts-expect-error unknown module does not inherit common
global('shared', undefined, 'missing').commonOnly;
// @ts-expect-error empty module is not a common placeholder
global('shared', undefined, '').commonOnly;
// @ts-expect-error no automatic current module inference
unbound('shared').localOnly;
// @ts-expect-error union modules must be narrowed
mixed('shared').localOnly;
// @ts-expect-error dynamic names need validation at the legacy boundary
global(wide).commonOnly;
// @ts-expect-error model names are strings
global(42);
// @ts-expect-error model config is not a numeric constructor argument
global('shared', 42);
// @ts-expect-error module must be a string or undefined
global('shared', undefined, null);
// @ts-expect-error module selection is in argument three only
ctx('shared', 'common').commonOnly;

type Host = { model(name: string, config?: any, module?: string): Base; value: number };
declare const think: ThinkModels<Host, 'multi'>;
declare const context: ContextModels<Host, 'multi', 'admin'>;
declare const controller: ControllerModels<Host, 'multi', 'admin'>;
const retained: number = think.value + context.value + controller.value;
think.model('shared').commonOnly;
context.model('shared').localOnly;
controller.model('shared').localOnly;
// @ts-expect-error model views require an existing runtime model host
type NotInstalled = ThinkModels<{value: number}>;

// @ts-expect-error inherited constructor is not a base ORM table lookup
global('constructor');
// @ts-expect-error unknown module fallback is also an ordinary object
global('constructor', undefined, 'absent');
// @ts-expect-error inherited names are unsafe in single-module applications
single('toString');
// @ts-expect-error legacy getter helpers are inherited keys too
ctx('__lookupGetter__');
// @ts-expect-error __proto__ is never an ordinary generated registry key
ctx('__proto__');
global('constructor', undefined, 'own').commonOnly;
global('toString', undefined, 'own').nestedOnly;
// @ts-expect-error the entire export type must be constructible
global('mixed', undefined, 'own');
// @ts-expect-error explicitly widening N cannot evade validation
global<string>('constructor');

// @ts-expect-error parsed adapter config is an object, not a number
global('config');
