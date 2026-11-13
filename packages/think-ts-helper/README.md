# think-ts-helper (private P1 prototype)

An **opt-in Service declaration generator with optional Model lookups**. It does not change ThinkJS
runtime loading, build applications, remove compiled output, watch files, or
implement the whole TypeScript migration plan. This package is private and is
not published.

From an application root in this workspace:

```sh
node /path/to/packages/think-ts-helper/cli.js generate .
node /path/to/packages/think-ts-helper/cli.js check .
```

Both commands accept `--source-dir src`, `--out-dir .thinkjs/types`, and `--models` (paths
relative to the application root). `check` exits 1 when generated content is
missing/stale; it never writes. Invalid input and conflicts also exit 1, with a
diagnostic on stderr.

```js
const {generate} = require('think-ts-helper');
const result = generate({root: process.cwd(), sourceDir: 'src', outDir: '.thinkjs/types'});
// result.changed: output names whose bytes differed
// result.manifest: stable source paths and effective per-module service maps
// generate({...options, check: true}) computes differences without writes.
```

Include `.thinkjs/types/**/*.d.ts` in the application's tsconfig. For JavaScript
service inference enable `allowJs`; enabling `checkJs` is optional. Generated
`index.d.ts` exports `AppThink<T>`, `AppContext<T>`, and
`AppController<T, ModuleName>` aliases for opt-in typed framework views. They
select the detected layout and strict literal-name mode. The base type `T` is
the application's existing ThinkJS/context/controller type. Existing ambient
ThinkJS declarations are not replaced. See `thinkjs/service-types` for the
underlying aliases and loose mode.

## Adopting the generated types

For the default Service-only output, existing values can be assigned to the generated views without a cast:

```ts
import type { Think, Context, Controller } from 'thinkjs';
import type { AppThink, AppContext, AppController } from './.thinkjs/types';

const app: AppThink<Think> = think;

export function handle(context: Context) {
  const ctx: AppContext<Context> = context;
  // ctx.service now uses generated service names and constructor types.
}
```

For class-based applications, annotate the members once in the application's
base Controller. The following example binds a multi-module Controller to the
`admin` module; single-module applications can omit the second type argument.
Adjust the relative import for the location of the base class.

```ts
import type { Context, Controller } from 'thinkjs';
import type { AppContext, AppController } from './.thinkjs/types';

export default class BaseController extends think.Controller {
  declare service: AppController<Controller, 'admin'>['service'];
  declare ctx: AppContext<Context>;
}
```

Business Controllers inherit this base normally. For Logic, extend `think.Logic`
and use `AppController<Logic, 'admin'>['service']` with the imported `Logic` type.
The `declare` keyword is essential: these are type-only declarations, not field
initializers. They do not shadow the runtime service method or replace the
constructor-injected context, including with `useDefineForClassFields: true`.
No runtime helper or service registry is needed in application code.

The module type argument describes the Controller's actual request module; it
does not select a module at runtime or infer one from its file path. A Controller
bound to `admin` uses admin's service map by default, while `this.ctx.service`
still defaults to common. Unbound multi-module Controllers need an explicit
module selector. Strict checks apply through the typed views and annotated
members; legacy `think.service` and unannotated values remain broadly typed.
Legacy fluent methods returning the original Controller type also retain that
legacy return type; use the annotated instance for strict service lookup.

The two legacy Context/Controller signatures now accept their actual constructor
argument shapes, including objects and numbers. Applications using this bridge
need those declarations as well as the new type-only subpath. This does not fix
the other legacy declaration errors: integration fixtures still use
`skipLibCheck: true`, while the standalone Service contract uses full declaration
checking. See [the adoption notes](../../docs/typescript-migration/p1-service-adoption.md).

## Optional Model lookup types

Enable this only in applications that already install and enable `think-model`:

```sh
node /path/to/packages/think-ts-helper/cli.js generate . --models
node /path/to/packages/think-ts-helper/cli.js check . --models
```

The equivalent API is `generate({root, models: true})`. This additionally scans
`model` directories, writes `model.d.ts` augmenting `think-model/model-types`,
and adds effective model maps at `manifest.models`. Default generation remains
byte-for-byte Service-only. No source module or plugin factory is executed.

With this opt-in, the generated `AppThink`, `AppContext`, and `AppController`
aliases compose both contracts. Their base type must already have a `model`
method. The fallback is inferred from that method's return type, preserving the
existing ORM declarations rather than duplicating them. Context now accepts an
optional module type argument too. Annotate type-only members once in a base
Controller or Logic class:

```ts
import type {} from 'think-model';
import type { Context, Controller } from 'thinkjs';
import type { AppContext, AppController } from './.thinkjs/types';

export default class BaseController extends think.Controller {
  declare model: AppController<Controller, 'admin'>['model'];
  declare service: AppController<Controller, 'admin'>['service'];
  declare ctx: AppContext<Context, 'admin'>;
}
```

Use `AppController<Logic, 'admin'>` in a base Logic class. Business classes need
no registry or cast. These declarations emit nothing and keep inherited methods
and the constructor-injected context. The explicit module is an application
assertion about the actual request, not automatic inference from a folder.

- Global/Service `model(name, config?, module?)` defaults to common. Context and
  Controller default to the request module, unlike Context's Service lookup.
- The second argument is adapter configuration (object, adapter-name string,
  null, or undefined). A module selector belongs in the **third** argument.
- Omitted/undefined module uses the default. An unknown explicit module,
  including `''`, does not inherit common and returns the base Model. In a
  single-module application, argument three has no lookup effect.
- Known model names resolve custom methods, with common inheritance and local
  override. Nested names stay exact lookup keys; runtime passes their basename
  as the constructor's table name. Ordinary unregistered table-name literals
  remain valid and expose existing ORM methods, not `any`.
- Known exports must be constructible with the runtime's two arguments and
  return instances compatible with the existing base Model. Constructors must
  accept the broad parsed config object until adapter schemas are typed. Objects, arrows,
  incompatible constructors and partially nonconstructible export unions are
  rejected rather than falling through to table lookup.
- Name/module unions return unions. An unbound multi-module context includes
  the base fallback, so narrow it before using module-specific custom methods.
- Runtime maps inherit Object.prototype. Unregistered inherited names such as
  `constructor` and `toString` are rejected; explicit valid own model overrides
  are supported. The generator rejects the prototype-mutating `__proto__` key
  for models/modules. Wide-string names cannot be proven safe and are rejected
  by this opt-in contract. Validate/narrow them or use the unchanged legacy API.

Unlike legacy Service's `any`, legacy Model lookup returns only a base Model.
Consequently, assigning an arbitrary legacy Think/Context value directly to a
custom-model view is not a proof that it has custom methods. The earlier
Service-only no-cast assignment example does **not** extend to Model-enabled
views. Use the tested base-class annotations, or an application boundary already
typed with the generated view. Legacy global calls remain unchanged.

Keep `--models` consistent in generate/check commands. Generating without it
removes only the previous helper-owned `model.d.ts`, so tsconfig declaration globs
do not retain a stale Model registry; user files are preserved. Check reports
this removal without performing it. Adding/removing/renaming models updates the
references on the next generation; application JavaScript cleanup remains the
existing build's responsibility.

Record generics, query result/projection types, relation lookup, `transModel`,
and schema-aware adapter configuration are not part of this slice. See the
[Model slice notes](../../docs/typescript-migration/p1-model-lookups.md).

## Discovery and outputs

- Discover lowercase `.ts` and `.js` recursively in each `service` directory;
  ignore `.d.ts`, hidden files/directories, and other extensions. Sources are
  parsed with pinned TypeScript 3.9.10, never imported or evaluated. Nested
  `node_modules` directories are excluded. Symlink services are rejected.
- As in `think-loader`, the existence of `src/common/config` selects multi-module
  layout; all immediate source directories are modules, including `common`.
  Otherwise use `src/service`. `__single__` is reserved for single-module maps.
- Nested names use `/`. Multi-module effective maps merge common services first,
  then local overrides. Duplicate `.ts`/`.js` names, case-only name collisions
  (including effective common/local collisions), and module case collisions
  are rejected before writing.
- `.thinkjs/types/service.d.ts` augments `ServiceModules` with
  `typeof import('../../src/...')` references for CommonJS/export-assignment
  sources, and `.default` selections for syntactic default exports. This keeps
  CommonJS objects with a property named `default` intact. `manifest.json` lists sorted effective name-to-source mappings;
  it contains no timestamps or absolute paths. `index.d.ts` imports the registry
  and exports layout-specific aliases.
- Output replacement is atomic **per file** (temporary sibling + rename), not a
  transaction across the output set. Unchanged files are not rewritten. Existing
  output files must carry this generator's marker; unowned files are never
  overwritten. Except the opt-out cleanup described above, other files are never deleted. Do not run concurrent generators
  with different configurations against the same output directory.

## Boundaries

The parser accepts explicit `export default`, default-exported declarations,
`export =`, and top-level `module.exports`/`exports.name` assignments. It rejects
named-only ES exports, export lists/re-exports, mixed export styles, conditional
or nested CommonJS export assignments, and `__esModule` interop markers with
`UNSUPPORTED_EXPORT`. Prefer one explicit service export. Application source
syntax must be parseable by TypeScript 3.9.10. The application compiler still
checks imports and dependencies and infers actual service shapes; the helper
does not emit or execute application code. Dynamic export manipulation and
transpiler-specific interop outside these source forms are unsupported. Runtime
deployment still needs the existing application build process.

Output must be outside the source directory. Symlink output ancestors are
rejected. Point the generator at a real application source directory rather
than a symlink tree.

The generator does not own the application tsconfig, build output, lockfile, or
watcher. Re-run `generate` after adding, renaming, or removing services; use
`check` in CI. Generated declarations target the TypeScript 3.9-era syntax floor;
application dependencies may impose a newer compiler requirement.

## Tests

```sh
node --test packages/think-ts-helper/test/*.test.js
```

Tests cover byte stability, stale checks, add/remove/rename, nested TS/JS,
non-execution, layout detection, common overrides, collisions, ownership, and
CLI behavior. Compiler and runtime-parity integration tests live with the
workspace's TypeScript migration tests.

A local synthetic benchmark is available (includes parsing and generated-file
comparison, excludes process/compiler startup and initial fixture creation):

```sh
node packages/think-ts-helper/scripts/benchmark.js 1000
```

Example on Node v24.22.1 in the development container: 1,000 simple TS service
files, initial generation 67 ms, median unchanged generation across five runs
26 ms. These are local observations, not a portability guarantee or CI gate.
