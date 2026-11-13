import type { ConfigCall, ThinkConfigs, ContextConfigs, ControllerConfigs } from 'think-config/config-types';

declare module 'think-config/config-types' {
  interface ConfigModules {
    __single__: {port: number; nullable: string | null; optional: number | undefined; 'nested.value': number};
    common: {shared: number; overridden: string; 'nested.value': string; optional: number | undefined; nullable: string | null};
    admin: {shared: number; overridden: number; 'nested.value': number; optional: number | undefined; nullable: string | null; local: boolean};
    api: {shared: number; overridden: boolean; 'nested.value': boolean; optional: number | undefined; nullable: string | null};
  }
}
declare const single: ConfigCall;
declare const global: ConfigCall<'multi'>;
declare const context: ConfigCall<'multi', 'admin'>;
declare const unbound: ConfigCall<'multi', string>;
declare const mixed: ConfigCall<'multi', 'common' | 'admin'>;
const a: number = single('port');
const b: number = single('nested.value', undefined, 'ignored');
const c: string = global('overridden');
const d: number = context('overridden');
const e: number = context('overridden', undefined, undefined);
const f: string = context('overridden', undefined, 'common');
const g: string = context('overridden', undefined, 'missing');
const h: string = context('overridden', undefined, '');
const i: string = global('overridden', undefined, 'admin,api');
const j: number | undefined = context('optional');
const k: unknown = context('not.declared');
const l: unknown = global();
const m: unknown = context('', undefined, 'admin');
const n: unknown = context(undefined, undefined, 'common');
const o: string | number = mixed('overridden');
const p: string | number | boolean = unbound('overridden');
declare const dynamic: string;
const q: unknown = global(dynamic);
const r: string | number | boolean = global('overridden', undefined, dynamic);
declare const maybeModule: 'admin' | undefined;
const s: string | number = global('overridden', undefined, maybeModule);
declare const name: 'shared' | 'overridden';
const t: string | number = global(name);
const u: unknown = global('shared', undefined, 'constructor');

const writeSingle: unknown = single('port', 3000);
single('nullable', null);
single('optional', 1);
const readUndefined: number | undefined = single('optional', undefined);
const writeMulti: void = context('overridden', 10);
context('overridden', 'common', 'common');
context('overridden', 3, undefined);
global('shared', 10, true);
context('shared', 10, 'admin,api,missing');
context('shared', 10, 'missing');
context('shared', 10, '');
context('shared', 10, dynamic);
unbound('shared', 10);
mixed('shared', 10);
global('nullable', null, true);
// @ts-expect-error current module override is numeric
const wrong: string = context('overridden');
// @ts-expect-error absent/dynamic paths are unknown, never any
const guessed: number = context('typo');
// @ts-expect-error whole-config reads are deliberately unknown
context().port;
// @ts-expect-error a value in argument two is a write, not a module selector
context('overridden', 'common');
// @ts-expect-error known paths reject mismatched values
single('port', '3000');
// @ts-expect-error unknown write paths could invalidate the declared schema
single('typo', 3000);
// @ts-expect-error dotted path schema is checked too
context('nested.value', 'wrong');
// @ts-expect-error all-module values must be valid in every module
global('overridden', 'unsafe', true);
// @ts-expect-error comma selectors are conservatively checked against every module
global('overridden', 10, 'admin,api');
// @ts-expect-error dynamic selectors must be safe for every possible target
global('overridden', 'unsafe', dynamic);
// @ts-expect-error union current modules cannot accept a value valid in only one
mixed('overridden', 10);
// @ts-expect-error local path is not declared in every module
global('local', true, true);
// @ts-expect-error union names require narrowing before a write
global(name, 1);
// @ts-expect-error explicit widening cannot evade known-path validation
global<string, string>('shared', 'unsafe');
// @ts-expect-error module union cannot make one target's invalid value valid
global('overridden', 10, maybeModule);
declare const maybeValue: number | undefined;
// @ts-expect-error undefined changes dispatch to a read; narrow before a write
single('port', maybeValue);
// @ts-expect-error false is not a supported write selector
global('shared', 1, false);
// @ts-expect-error true is a write-only selector in the typed API
global('shared', undefined, true);
// @ts-expect-error Config does not implement object/bulk-value writes
global({shared: 1});
// @ts-expect-error reads have string names
global(42);
// @ts-expect-error runtime inherited module entries are not config instances
const inherited: number = global('shared', undefined, 'constructor');

type Host = {config(name?: string, value?: any, module?: string | boolean): any; retained: number};
declare const app: ThinkConfigs<Host, 'multi'>;
declare const ctx: ContextConfigs<Host, 'multi', 'admin'>;
declare const controller: ControllerConfigs<Host, 'multi', 'admin'>;
const keep: number = app.retained + ctx.retained + controller.retained;
const current: number = ctx.config('overridden') + controller.config('overridden');
const common: string = app.config('overridden');
// @ts-expect-error views require an existing runtime Config host
type NotInstalled = ThinkConfigs<{retained: number}>;

// Optional parameter inference must not discard an explicitly possible undefined.
declare const maybeName: 'shared' | undefined;
// @ts-expect-error undefined reads the whole config, not one numeric value
const maybeNameValue: number = global(maybeName);
// @ts-expect-error undefined module reads common, not only admin
const maybeModuleValue: number = global('overridden', undefined, maybeModule);
