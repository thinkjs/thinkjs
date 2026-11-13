/**
 * Opt-in, type-only Config contract (TypeScript 3.9+).
 * Each module maps effective runtime lookup paths to their value types, not raw
 * source exports. Include dotted paths explicitly; '__single__' is reserved.
 * Describe every runtime module. Multi-module names must be nonempty and
 * comma-free; '__proto__' module names are unsupported by this opt-in contract.
 * Registration is explicit in this slice. Nothing executes or merges config.
 */
export interface ConfigModules {}
export type ConfigLayout = 'single' | 'multi';
export interface ConfigHost { config(...args: any[]): unknown; }
type ModuleName = Exclude<Extract<keyof ConfigModules, string>, '__single__'>;
type MapAt<M> = M extends keyof ConfigModules ? ConfigModules[M] : {};
type AllMaps = MapAt<'common'> | MapAt<ModuleName>;
type Current<M, Default extends string> = M extends undefined ? Default : M;
// These inherited properties are not Config instances in the runtime map.
type PrototypeName = 'constructor' | '__proto__' | 'toString' | 'toLocaleString' | 'valueOf' |
  'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' |
  '__defineGetter__' | '__defineSetter__' | '__lookupGetter__' | '__lookupSetter__';
type ReadMap<M> = M extends string ? string extends M ? AllMaps :
  M extends ModuleName ? MapAt<M> : M extends PrototypeName ? {} : MapAt<'common'> : {};
type ReadMaps<L extends ConfigLayout, M> = L extends 'single' ? MapAt<'__single__'> : ReadMap<M>;
type ReadValue<R, N> = R extends unknown ? N extends '' | undefined ? unknown :
  N extends keyof R ? R[N] : unknown : never;
// Unknown strings may be comma-separated selectors. Without TS template literal
// types, check them against every module, rather than guessing their targets.
type WriteMap<M> = M extends ModuleName ? MapAt<M> : AllMaps;
type WriteMaps<L extends ConfigLayout, M> = L extends 'single' ? MapAt<'__single__'> : WriteMap<M>;
type WriteFailure<R, N extends string, V> = R extends unknown ?
  N extends keyof R ? [V] extends [Exclude<R[N], undefined>] ? never : N : N : never;
type IsUnion<T, C = T> = T extends C ? [C] extends [T] ? false : true : never;

/**
 * Reads preserve declared path types; unregistered paths and whole-config reads
 * return unknown. Missing/environment-specific values must include undefined.
 * Undefined in argument two is always a read, never a write or module selector.
 * Writes require one known path and a defined value valid in every possible
 * target. Narrow union paths and possibly-undefined values before writing.
 * Multi-module writes return void. Single-module writes return the runtime
 * Config instance as unknown; no unchecked chaining contract is introduced.
 */
export interface ConfigCall<L extends ConfigLayout = 'single', DefaultModule extends string = 'common'> {
  (): unknown;
  <N extends string | undefined>(name: N, value?: undefined): ReadValue<ReadMaps<L, DefaultModule>, N>;
  <N extends string | undefined, M extends string | undefined>(
    name: N, value: undefined, module: M
  ): ReadValue<ReadMaps<L, Current<M, DefaultModule>>, N>;
  <N extends string, V extends {} | null>(
    name: N & (true extends IsUnion<N> ? never : unknown),
    value: V & ([WriteFailure<WriteMaps<L, DefaultModule>, N, V>] extends [never] ? unknown : never)
  ): L extends 'single' ? unknown : void;
  <N extends string, V extends {} | null, M extends string | true | undefined>(
    name: N & (true extends IsUnion<N> ? never : unknown),
    value: V & ([WriteFailure<WriteMaps<L, Current<M, DefaultModule>>, N, V>] extends [never] ? unknown : never),
    module: M
  ): L extends 'single' ? unknown : void;
}
export type ThinkConfigs<Base extends ConfigHost, L extends ConfigLayout = 'single'> = Omit<Base, 'config'> & {
  config: ConfigCall<L, 'common'>;
};
/** Both Context and Controller default to the current request module. */
export type ContextConfigs<Base extends ConfigHost, L extends ConfigLayout = 'single', M extends string = string> = Omit<Base, 'config'> & {
  config: ConfigCall<L, M>;
};
export type ControllerConfigs<Base extends ConfigHost, L extends ConfigLayout = 'single', M extends string = string> = ContextConfigs<Base, L, M>;
