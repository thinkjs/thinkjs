# P1 slice: opt-in Config contract

This increment advances [#1795](https://github.com/thinkjs/thinkjs/issues/1795),
stacked on the Model lookup PR [#1800](https://github.com/thinkjs/thinkjs/pull/1800)
at `d214fb1a6248e02bdbbf85e538ff4ca2e0c34cf2`. It does not complete P1 or add
Config generation to think-ts-helper.

## Scope and ownership

`think-config/config-types.d.ts` owns a type-only `ConfigModules` registry,
`ConfigCall` and `ThinkConfigs` / `ContextConfigs` / `ControllerConfigs` views.
The runtime, legacy declarations, package root, dependencies and generated
Service/Model output remain unchanged. Use `import type` with this subpath.

The registry maps each runtime module to **effective lookup paths**, not config
files or raw exports. It must describe every runtime module, including common,
and the values possible after loader merging and environment selection. This
opt-in contract requires nonempty, comma-free module names and does not support
`__proto__` as a module name. A comma-containing directory is a literal module on
reads but multiple targets on writes; TS 3.9 cannot distinguish that case in a
string type. Such applications must use the unchanged legacy API for now. Dotted
paths must be explicit. A `nested.value` entry describes traversal by `Config.get`,
not a literal own property named `nested.value`. Do not register array indexes:
the current getter stops traversal when an intermediate value is not an object.
Optional/environment-specific paths must include `undefined`; values with
possible environment overrides need the corresponding union.

These are explicit schema assertions for the P1 contract experiment. No helper
currently derives or verifies them. Register only paths the runtime can read,
and keep parent/child path types consistent when allowing whole-object writes.
Untyped writes or inaccurate schemas can invalidate any declared type. This is
not runtime validation, and the snapshot can change after a read.

```ts
import type { ConfigCall } from 'think-config/config-types';

declare module 'think-config/config-types' {
  interface ConfigModules {
    common: { port: number; 'database.host': string; optional: number | undefined };
    admin: { port: string; 'database.host': string; optional: number | undefined };
  }
}

declare const config: ConfigCall<'multi'>;
const port: number = config('port');
const adminPort: string = config('port', undefined, 'admin');
config('database.host', 'localhost', true);
config('database.host', 'localhost', 'admin,common');
// config('port', 3000, true) is rejected: admin's port is a string.
```

Single-module projects use `__single__` instead of runtime module names and
`ConfigCall<'single'>`. The optional third argument is ignored in single mode.

## Read and write dispatch

- Global lookup defaults to common. Context/Controller/Logic use the request
  module; a module-bound base class is explicit, not inferred from a filename.
- `undefined` as argument two means read. Explicit `undefined` as argument three
  preserves the current/global default, including when part of a union.
- For reads, unknown or empty module strings fall back to common. A comma string
  is one literal read selector, not a list. Unbound/union modules produce unions
  of possible values. Inherited module names such as `constructor` can throw;
  undeclared inherited names therefore have no precise return contract.
- Unknown/dynamic paths and whole-config reads (`config()`, `config('')`,
  `config(undefined)`) return `unknown`, never an unchecked `any`.
- A second string is a value to write, not a module selector. `null` is a defined
  value and can be written when the schema allows it. Narrow a value that may be
  `undefined` before a write; otherwise runtime dispatch may become a read.
- Multi-module writes accept one module, comma-separated module strings, or
  `true` for all modules. Unknown modules are skipped on writes, not redirected
  to common. An empty write selector is a no-op. Writes return `void`.
- Single-module writes return the runtime `Config` object. This slice exposes
  that handle as `unknown` rather than inventing safe chaining through its
  unrestricted mutable `config`, `get`, and `set` methods.
- There is no object/bulk-value overload. Bulk refers to target modules only.

Writes require a known, narrowed path and a value valid in every possible target.
TypeScript 3.9 has no template literal types, so comma-separated and dynamic
selectors are conservatively checked against **all** registered modules.
An unbound current module has the same conservative rule. Narrower explicit
module calls are available when modules disagree on a path or its value type.
Unknown write paths, union path names and possibly-undefined write values require
narrowing or the unchanged legacy boundary. These restrictions are opt-in only.

## Composition and adoption

The views can wrap existing generated Model/Service views without losing their
strictness. Add type-only declarations once to an application's base class:

```ts
import type {} from 'think-model';
import type { Controller, Context } from 'thinkjs';
import type { AppController, AppContext } from './.thinkjs/types';
import type { ControllerConfigs, ContextConfigs } from 'think-config/config-types';

type AdminController = ControllerConfigs<AppController<Controller, 'admin'>, 'multi', 'admin'>;
type AdminContext = ContextConfigs<AppContext<Context, 'admin'>, 'multi', 'admin'>;

class BaseController extends think.Controller {
  declare config: AdminController['config'];
  declare service: AdminController['service'];
  declare model: AdminController['model'];
  declare ctx: AdminContext;
}
```

The same pattern applies to `think.Logic`. `ThinkConfigs<AppThink<Think>, 'multi'>`
provides the global view. No runtime wrapper, import, class field or dispatch
change is added. Existing legacy applications need not opt in.

## Why source generation is a separate slice

Config loading is not Service or Model loading:

1. `think-loader/loader/config.js` merges **raw** `require()` exports. It does not
   use Service's default-export interop. An ordinary emitted TS `export default`
   object contributes a `default` property rather than its members at the root.
2. Exported functions are not invoked as config factories. The loader merges
   enumerable properties on the function. Blindly applying `ReturnType` would
   invent runtime values that do not exist.
3. Merge order is system config, common base, local base, common environment,
   local environment, then formatted adapters. Deep object merges and indexed
   array merges differ from a top-level TypeScript intersection or override.
4. Adapter normalization merges shared fields, removes `common`, and resolves
   string handles. Source-only references cannot pretend these are unchanged.

The new runtime fixture locks the first two points; P0 fixtures already cover
merge precedence and arrays. Future Config generation must implement these rules
without executing business modules, or explicitly diagnose unsupported cases.
It must also make environment-optional values and effective dotted paths honest.
No loader behavior is changed here to make an attractive type design work.

## Verification

New standalone positive/negative fixtures use full declaration checking, including
incomplete common schemas and generated Config/Model/Service view composition.
Application fixtures compile and execute actual ConfigLoader, getConfigFn,
Controller, Logic and the Model/Service extensions in single/multi layouts with
both class-field emit modes. Runtime fixtures lock dispatch, fallback/no-op
asymmetry, return values, raw default exports and non-executed config functions.

```sh
pnpm test:typescript-migration
THINKJS_AUDIT_TYPESCRIPT=/absolute/path/to/typescript-5.9.3 \
  node --test --test-concurrency=1 test/typescript-migration/*.test.cjs
pnpm lint
pnpm test
git diff --check
```

Legacy framework integration still uses `skipLibCheck`; this is not a claim that
legacy declarations are repaired. Final results and environment limits are in
the PR. Automatic Config/schema generation, Extend inference, installed whole-app
acceptance, watch/build integration and framework source migration remain future
work. No merge or package publication is requested.
