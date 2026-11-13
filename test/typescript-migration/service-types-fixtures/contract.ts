import type {ThinkServices, ContextServices, ControllerServices} from 'thinkjs/service-types';
class User { constructor(public id: number, public label?: string) {} userOnly = true; }
class Common { commonOnly = true; }
class Admin { constructor(public label: string) {} adminOnly = true; }
class Optional { constructor(public value?: string) {} }
class Literal { constructor(public value: 'text' | 'admin') {} }
class Undef { constructor(public value: undefined, public count: number) {} }
declare module 'thinkjs/service-types' {
  interface ServiceModules {
    '__single__': {user: typeof User; 'nested/object': {readonly value: 42}; optional: typeof Optional; wrapped: typeof User; defaultObject: {default: string}; arrow: (id: number) => string};
    common: {same: typeof Common; user: typeof User; obj: {value: number}; optional: typeof Optional; literal: typeof Literal};
    admin: {same: typeof Admin; undef: typeof Undef; only: typeof Admin};
    empty: {};
  }
}
type Legacy = {service(name: string, ...args: any[]): any; marker: true};
declare const single: ThinkServices<Legacy>;
declare const compat: ThinkServices<Legacy, 'single', 'compat'>;
declare const dynamic: string;
const user: User = single.service('user', 1, 'ok');
const wrapped: User = single.service('wrapped', 1);
const object: 42 = single.service('nested/object').value;
single.service('optional');
single.service('optional', undefined);
const marker: true = single.marker;
// @ts-expect-error known names cannot escape via legacy any overload
single.service('uesr', 1);
// @ts-expect-error wrong constructor
single.service('user', 'bad');
// @ts-expect-error required constructor
single.service('user');
// @ts-expect-error object exports have no constructor args
single.service('nested/object', 1);
// @ts-expect-error dynamic names are unknown
single.service(dynamic).missing;
compat.service('unregistered', 1);
// @ts-expect-error compat fallback does not weaken known constructors
compat.service('user', 'bad');
// @ts-expect-error compat unregistered names are unknown
compat.service('unregistered').missing;

declare const globalMulti: ThinkServices<Legacy, 'multi'>;
declare const context: ContextServices<Legacy, 'multi'>;
declare const admin: ControllerServices<Legacy, 'multi', 'admin'>;
declare const empty: ControllerServices<Legacy, 'multi', 'empty'>;
declare const unbound: ControllerServices<Legacy, 'multi'>;
declare const union: ControllerServices<Legacy, 'multi', 'admin' | 'empty'>;
const common: Common = globalMulti.service('same');
const ctxCommon: Common = context.service('same');
const overridden: Admin = globalMulti.service('same', 'admin', 'ok');
const inherited: User = globalMulti.service('user', 'admin', 1);
globalMulti.service('user', undefined, 1);
globalMulti.service('user', '', 1);
globalMulti.service('user', null, 1);
globalMulti.service('optional');
// @ts-expect-error global multi module does not treat position two as constructor arg
globalMulti.service('user', 1);
// @ts-expect-error required constructor args
globalMulti.service('user');
// @ts-expect-error typo module
globalMulti.service('same', 'admn');
// @ts-expect-error typo name on recognized module
globalMulti.service('smae', 'admin');
// @ts-expect-error invalid explicit constructor
globalMulti.service('same', 'admin', 42);
const implicit: Admin = admin.service('same', 'ok');
const implicitInherited: User = admin.service('user', 1);
const fallback: Common = empty.service('same');
const forwarded: Undef = admin.service('undef', undefined, 1);
const explicitCommon: Common = admin.service('same', 'common');
const explicitLiteral: Literal = admin.service('literal', 'admin', 'admin');
const implicitLiteral: Literal = admin.service('literal', 'text');
// @ts-expect-error recognized module name consumes position two, leaving required constructor empty
admin.service('literal', 'admin');
// @ts-expect-error undefined is forwarded in controller, not a default module placeholder
admin.service('user', undefined, 1);
// @ts-expect-error required current-module constructor
admin.service('same');
// @ts-expect-error wrong current-module constructor
admin.service('same', 123);
// @ts-expect-error ambiguous broad string cannot safely be an implicit constructor argument
const unsafe: Admin = admin.service('same', dynamic);
// @ts-expect-error current module unknown; implicit calls prohibited
unbound.service('same');
// @ts-expect-error union current module; implicit calls prohibited
union.service('same');
const explicitUnknown: Admin = unbound.service('same', 'admin', 'ok');
// @ts-expect-error dynamic module return unknown
globalMulti.service('same', dynamic).missing;
// @ts-expect-error dynamic service name return unknown
admin.service(dynamic).missing;
// @ts-expect-error non-common-only service cannot be resolved globally without module
globalMulti.service('undef');

const ordinaryDefault: string = single.service('defaultObject').default;
// @ts-expect-error functions without a construct signature are unsupported
single.service('arrow');
// @ts-expect-error functions without a construct signature are unsupported
single.service('arrow', 1);
// @ts-expect-error compat cannot turn unsupported known callable into lookup
compat.service('arrow', 1);
// @ts-expect-error explicit admin module cannot widen to common to drop constructor args
globalMulti.service('same', 'admin');
// @ts-expect-error controller explicit module cannot widen to common to drop constructor args
unbound.service('same', 'admin');
// @ts-expect-error strict typo in bound controller
admin.service('typo');
// @ts-expect-error Context retains global module position, not Controller argument forwarding
context.service('user', 1);
declare const multiCompat: ThinkServices<Legacy, 'multi', 'compat'>;
multiCompat.service('missing', 'admin', 1);
// @ts-expect-error compat cannot weaken recognized module constructor
multiCompat.service('same', 'admin', 42);
// @ts-expect-error compat cannot weaken common constructor
multiCompat.service('user', undefined, 'bad');

declare const moduleUnion: 'common' | 'admin';
// @ts-expect-error explicit union modules cannot validate branch-specific constructor arguments
globalMulti.service('same', moduleUnion, 'ok');
// @ts-expect-error explicit union modules also require narrowing in Controllers
admin.service('same', moduleUnion, 'ok');
// @ts-expect-error common fallback cannot hide a known explicit module constructor error
multiCompat.service('only', 'admin', 1);
declare const commonCompat: ControllerServices<Legacy, 'multi', 'common', 'compat'>;
// @ts-expect-error implicit compat fallback must not consume an explicit known module
commonCompat.service('only', 'admin', 1);
const only: Admin = multiCompat.service('only', 'admin', 'ok');
const onlyController: Admin = commonCompat.service('only', 'admin', 'ok');

// @ts-expect-error explicit generic unions must not weaken constructor requirements
single.service<'user' | 'optional'>('user');
declare const nameUnion: 'user' | 'optional';
// @ts-expect-error narrow a union name before checking branch-specific constructor arguments
single.service(nameUnion, 'wrong for user');
