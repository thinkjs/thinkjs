/**
 * Opt-in, type-only service lookup contract (TypeScript 3.9+).
 * Augment ServiceModules with raw source exports. '__single__' is reserved for
 * single-module applications; multi-module keys include 'common'. Never import
 * this subpath as a runtime value. Legacy service entry points remain broadly typed.
 */
export interface ServiceModules {}
export type ServiceLayout = 'single' | 'multi';
export type ServiceMode = 'strict' | 'compat';
// Registry entries describe the actual loader export, not the module namespace.
// For ES default exports generate typeof import('...').default; for export= use
// typeof import('...'). This preserves ordinary objects with a 'default' property.
export type ServiceExport<T> = T;
type ModuleName = Exclude<Extract<keyof ServiceModules, string>, '__single__'>;
type MapAt<M> = M extends keyof ServiceModules ? ServiceModules[M] : {};
type ServicesAt<M> = Omit<MapAt<'common'>, keyof MapAt<M>> & MapAt<M>;
type Names<R> = Extract<keyof R, string>;
type SupportedNames<R> = {[N in Names<R>]: [Args<R[N]>] extends [never] ? never : N}[Names<R>];
type NoArgNames<R> = {[N in Names<R>]: [] extends Args<R[N]> ? N : never}[Names<R>];
type Tail<A extends unknown[]> = ((...args: A) => void) extends ((first: any, ...rest: infer R) => void) ? R : never;
type Result<T> = ServiceExport<T> extends new (...args: any[]) => infer I ? I : ServiceExport<T> extends (...args: any[]) => any ? never : ServiceExport<T>;
type Args<T> = ServiceExport<T> extends new (...args: infer A) => any ? A : ServiceExport<T> extends (...args: any[]) => any ? never : [];
type FallbackName<N extends string, R, Mode extends ServiceMode> =
  string extends N ? N : Mode extends 'compat' ? N extends Names<R> ? never : N : never;

/** Narrow union service/module names before lookup: constructor arguments must
 * be checked against one selected export, not a union of incompatible tuples.
 * Dynamic wide-string lookups return unknown. Compat additionally accepts
 * unregistered literal names as unknown, without weakening known constructors. */
export interface SingleService<Mode extends ServiceMode = 'strict'> {
  <N extends SupportedNames<MapAt<'__single__'>>>(name: N & (true extends IsUnion<N> ? never : unknown), ...args: Args<MapAt<'__single__'>[N]>): Result<MapAt<'__single__'>[N]>;
  <N extends string>(name: FallbackName<N, MapAt<'__single__'>, Mode>, ...args: unknown[]): unknown;
}

export interface MultiService<Mode extends ServiceMode = 'strict'> {
  <N extends NoArgNames<ServicesAt<'common'>>>(name: N): Result<ServicesAt<'common'>[N]>;
  <M extends ModuleName, N extends SupportedNames<ServicesAt<M>>>(name: N & (true extends IsUnion<N> ? never : unknown), module: M & (true extends IsUnion<M> ? never : unknown), ...args: Args<ServicesAt<M>[N]>): Result<ServicesAt<M>[N]>;
  <N extends SupportedNames<ServicesAt<'common'>>>(name: N & (true extends IsUnion<N> ? never : unknown), module: undefined | null | '', ...args: Args<ServicesAt<'common'>[N]>): Result<ServicesAt<'common'>[N]>;
  <N extends string>(name: FallbackName<N, ServicesAt<'common'>, Mode>, module?: undefined | null | '', ...args: unknown[]): unknown;
  <M extends ModuleName, N extends string>(name: FallbackName<N, ServicesAt<M>, Mode>, module: M & (true extends IsUnion<M> ? never : unknown), ...args: unknown[]): unknown;
  <M extends string>(name: string, module: string extends M ? M : never, ...args: unknown[]): unknown;
}

type IsUnion<T, C = T> = T extends C ? [C] extends [T] ? false : true : never;
type KnownCurrent<M extends string> = string extends M ? never : true extends IsUnion<M> ? never : M extends ModuleName ? M : never;
// In a controller, a recognized module in position two wins over constructor
// arguments. Broad string constructor arguments are ambiguous too: require an
// explicit module in that case. Undefined is forwarded, not a module placeholder.
export interface MultiControllerService<CurrentModule extends string = string, Mode extends ServiceMode = 'strict'> {
  <M extends ModuleName, N extends SupportedNames<ServicesAt<M>>>(name: N & (true extends IsUnion<N> ? never : unknown), module: M & (true extends IsUnion<M> ? never : unknown), ...args: Args<ServicesAt<M>[N]>): Result<ServicesAt<M>[N]>;
  <N extends NoArgNames<ServicesAt<KnownCurrent<CurrentModule>>>>(
    name: [KnownCurrent<CurrentModule>] extends [never] ? never : N
  ): Result<ServicesAt<KnownCurrent<CurrentModule>>[N]>;
  <N extends SupportedNames<ServicesAt<KnownCurrent<CurrentModule>>>, F extends string | number | boolean | symbol | bigint | object | null | undefined>(
    name: [KnownCurrent<CurrentModule>] extends [never] ? never : N & (true extends IsUnion<N> ? never : unknown),
    first: F & (F extends Args<ServicesAt<KnownCurrent<CurrentModule>>[N]>[0] ? unknown : never) & (Extract<ModuleName, F> extends never ? unknown : never),
    ...rest: Tail<Args<ServicesAt<KnownCurrent<CurrentModule>>[N]>>
  ): Result<ServicesAt<KnownCurrent<CurrentModule>>[N]>;
  <M extends ModuleName, N extends string>(name: FallbackName<N, ServicesAt<M>, Mode>, module: M & (true extends IsUnion<M> ? never : unknown), ...args: unknown[]): unknown;
  <M extends string>(name: string, module: string extends M ? M : never, ...args: unknown[]): unknown;
  <N extends string>(name: [KnownCurrent<CurrentModule>] extends [never] ? never : FallbackName<N, ServicesAt<KnownCurrent<CurrentModule>>, Mode>): unknown;
  <N extends string, F extends string | number | boolean | symbol | bigint | object | null | undefined>(
    name: [KnownCurrent<CurrentModule>] extends [never] ? never : FallbackName<N, ServicesAt<KnownCurrent<CurrentModule>>, Mode>,
    first: F & (Extract<ModuleName, F> extends never ? unknown : never), ...args: unknown[]
  ): unknown;
}
export type ServiceCall<L extends ServiceLayout = 'single', Mode extends ServiceMode = 'strict'> = L extends 'multi' ? MultiService<Mode> : SingleService<Mode>;
export type ThinkServices<Base, L extends ServiceLayout = 'single', Mode extends ServiceMode = 'strict'> = Omit<Base, 'service'> & {service: ServiceCall<L, Mode>};
/** Context forwards directly to think.service, including its common default. */
export type ContextServices<Base, L extends ServiceLayout = 'single', Mode extends ServiceMode = 'strict'> = ThinkServices<Base, L, Mode>;
/** A multi-module Controller needs a known literal current module for implicit
 * calls. Unbound/union current modules must use an explicit recognized module. */
export type ControllerServices<Base, L extends ServiceLayout = 'single', CurrentModule extends string = string, Mode extends ServiceMode = 'strict'> = Omit<Base, 'service'> & {
  service: L extends 'multi' ? MultiControllerService<CurrentModule, Mode> : SingleService<Mode>;
};
