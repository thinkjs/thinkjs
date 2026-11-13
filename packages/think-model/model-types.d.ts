/**
 * Opt-in, type-only custom Model lookup contract (TypeScript 3.9+).
 * Enable the think-model runtime extension separately. Registry entries are raw
 * loader exports; '__single__' is reserved for single-module applications.
 * Query/record typing remains the responsibility of the existing ORM types.
 */
export interface ModelModules {}
export type ModelLayout = 'single' | 'multi';
/** Adapter name or override configuration, not a module selector. */
export type ModelConfig = string | object | null;
/** The legacy ORM owns the fallback type. Do not duplicate it here. */
export interface ModelHost { model(name: string, ...args: any[]): unknown; }
export type ModelBase<Base extends ModelHost> = ReturnType<Base['model']>;
type ModuleName = Exclude<Extract<keyof ModelModules, string>, '__single__'>;
type MapAt<M> = M extends keyof ModelModules ? ModelModules[M] : {};
// Only actual modules inherit common. An unknown runtime module uses an empty map.
type ModelsAt<M> = M extends ModuleName ? Omit<MapAt<'common'>, keyof MapAt<M>> & MapAt<M> : {};
// Runtime supplies basename(name) and a parsed config object. Until adapter
// schemas are typed, a model constructor must accept that broad object boundary.
type Instance<T, Base> = [T] extends [new (name: string, config: object) => Base] ?
  T extends new (name: string, config: object) => infer I ? I : never : never;
type Names<R> = Extract<keyof R, string>;
type Instances<R, Base> = {[N in Names<R>]: Instance<R[N], Base>}[Names<R>];
type Lookup<R, N extends string, Base> = string extends N ? Base | Instances<R, Base> :
  N extends keyof R ? Instance<R[N], Base> : Base;
// Runtime maps are ordinary objects. These inherited keys are not table names.
type PrototypeName = 'constructor' | '__proto__' | 'toString' | 'toLocaleString' | 'valueOf' |
  'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' |
  '__defineGetter__' | '__defineSetter__' | '__lookupGetter__' | '__lookupSetter__';
type Invalid<R, N extends string, Base> = string extends N ? never :
  N extends keyof R ? [Instance<R[N], Base>] extends [never] ? N : never : N extends PrototypeName ? N : never;
type Maps<L extends ModelLayout, M extends string> = L extends 'single' ? MapAt<'__single__'> :
  string extends M ? ModelsAt<ModuleName> | {} : ModelsAt<M>;
type Result<R, N extends string, Base> = R extends unknown ? Lookup<R, N, Base> : never;
type InvalidName<R, N extends string, Base> = R extends unknown ? Invalid<R, N, Base> : never;
type Current<M extends string | undefined, Default extends string> = M extends string ? M : Default;
type CallResult<L extends ModelLayout, M extends string, N extends string, Base> =
  Result<Maps<L, M>, N, Base> | (L extends 'multi' ? string extends M ? Base : never : never);

/** Unlike Service, unregistered table names are valid. Known model exports must
 * construct ORM instances. Union names/modules produce unions; unbound current
 * modules include the base fallback. Wide-string names must use the unchanged
 * legacy boundary: inherited object keys make their ORM return unsafe to infer.
 * Narrow before using a module-specific custom method. No runtime wrapper or import is required. */
export interface ModelCall<Base, L extends ModelLayout = 'single', DefaultModule extends string = 'common'> {
  <N extends string, M extends string | undefined = undefined>(
    name: N & (string extends N ? never : unknown) & ([InvalidName<Maps<L, Current<M, DefaultModule>>, N, Base>] extends [never] ? unknown : never),
    config?: ModelConfig,
    module?: M
  ): CallResult<L, Current<M, DefaultModule>, N, Base>;
}
export type ThinkModels<Base extends ModelHost, L extends ModelLayout = 'single'> = Omit<Base, 'model'> & {
  model: ModelCall<ModelBase<Base>, L, 'common'>;
};
/** Context and Controller both default model lookup to the request module. */
export type ContextModels<Base extends ModelHost, L extends ModelLayout = 'single', M extends string = string> = Omit<Base, 'model'> & {
  model: ModelCall<ModelBase<Base>, L, M>;
};
export type ControllerModels<Base extends ModelHost, L extends ModelLayout = 'single', M extends string = string> = ContextModels<Base, L, M>;
