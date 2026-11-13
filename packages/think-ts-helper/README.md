# think-ts-helper (private P1 prototype)

An **opt-in Service declaration generator with optional Model and Config lookups**. It does not change ThinkJS
runtime loading, build applications, remove compiled output, or
implement the whole TypeScript migration plan. This package is private and is
not published.

From an application root in this workspace:

```sh
node /path/to/packages/think-ts-helper/cli.js generate .
node /path/to/packages/think-ts-helper/cli.js check .
node /path/to/packages/think-ts-helper/cli.js watch .
```

All commands accept `--source-dir src`, `--out-dir .thinkjs/types`, `--models`, and `--configs` (paths
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
source inference enable `allowJs`; enabling `checkJs` is optional. Generated
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

## Optional static Config generation

`generate({root, configs: true})` or `generate . --configs` adds `config.d.ts`,
augments `think-config/config-types`, and composes Config into the generated
application views. It can be combined with `--models`; each option is independent.
Use the same options with `check`. Keep `thinkjs` installed in the application:
the helper resolves and reads that installation's actual system config without
executing it. With strict dependency isolation (for example pnpm), also declare
`think-config` as a direct build dependency: the generated declarations import
`think-config/config-types`, which cannot rely on transitive package visibility.
Use the version containing this new type-only subpath. See the
[installed-application acceptance gate](../../docs/typescript-migration/p1-installed-application.md)
for tarball consumption before publication. This is a bounded static-object prototype, not general evaluation
of arbitrary config code.

```sh
node /path/to/packages/think-ts-helper/cli.js generate . --configs --models
node /path/to/packages/think-ts-helper/cli.js check . --configs --models
```

The base type must have a `config` method. Add its type-only declaration once:

```ts
import type { Context, Controller } from 'thinkjs';
import type { AppContext, AppController } from './.thinkjs/types';

export default class BaseController extends think.Controller {
  declare config: AppController<Controller, 'admin'>['config'];
  declare service: AppController<Controller, 'admin'>['service'];
  declare ctx: AppContext<Context, 'admin'>;
}
```

Use the same pattern for Logic and add the Model declaration from the previous
section when enabled. No manual `ConfigModules` registry, runtime wrapper or
business-class assertion is needed for supported sources. Do not combine an
explicit registry for the same modules with automatic Config generation.

Supported source forms:

- JavaScript `module.exports = {...}`, `exports.key = value` or
  `module.exports.key = value`, TS `export = config`, and ES default/named const
  exports. Whole-object and property assignments must not be mixed or repeated.
- CommonJS assignments in `.ts` are diagnosed: TypeScript does not expose
  them as module exports. Use `export = config` or a `.js` file instead.
- Unannotated `const` bindings to static objects/scalars, including references
  to other local consts and shorthand object properties. `as const` is supported.
- Nested plain object literals, strings, numbers, booleans, null, undefined,
  static numeric arithmetic, and function/arrow values. Functions are retained
  as values and never invoked. Application value types reference the original
  source with `typeof import(...)` rather than copying signatures.
- Only immediate `config.ts`/`config.js` and `config.<env>.ts`/`.js` files are
  config inputs. Router/middleware/other files are not config namespaces.

Runtime parity:

- Config uses **raw CommonJS namespaces**, unlike Service/Model interop.
  `export default {port: 3000}` contributes `default.port`, not `port`.
  Prefer `const config = {...}; export = config` for root-level config.
- User config is deeply merged in this order: common base, module base, common
  environment, module environment. The merged user result then overlays system
  defaults. Objects merge recursively; undefined does not replace an existing
  value. Replaced object branches do not leave fictional nested paths.
- Generated paths describe every module, inherited fields, and dotted object
  reads. All discovered environments **plus a base-only environment** are
  included. Environment-only fields include undefined; possible type changes
  form unions. Parent object types also mark environment-only members optional.
- System scalar defaults are inferred from the installed file. System callback
  values remain `unknown`, rather than borrowing imprecise framework signatures.
  Unknown paths and whole-config reads remain `unknown` through the contract.
- Global Config defaults to common; Context/Controller/Logic default to the
  explicitly bound current module. Writes retain the Config contract's rules.
  See [the contract notes](../../docs/typescript-migration/p1-config-contract.md).

Unsupported shapes fail **before any output changes**, with a source-path
explanation: adapter files (which require runtime normalization), arrays (which
lodash merges by index), imports/re-exports, spreads, getters/method syntax,
computed keys, arbitrary type assertions/annotations (including JSDoc types), conditional exports,
mutations, dynamic expressions, and object-exported config factories. Function
values are fine, but are never interpreted using `ReturnType`. Unsafe/inherited
keys and literal dotted keys are rejected. Module names must be comma-free and
must not be `__proto__`. TS/JS duplicates, case collisions and input/output
symlinks are diagnosed. Use the explicit Config contract without `--configs`
for applications outside these boundaries; no dynamic execution fallback exists.

`manifest.configs` records environment names and each module's ordered source
paths. Rename/delete is reflected on the next generation. Disabling `--configs`
removes only the previously owned `config.d.ts`; check reports removal without
performing it. Existing diagnostics leave old output untouched, so generation
failure must stop typecheck/build. Do not treat old declarations as fresh.
Compiled JavaScript cleanup, application dev-process integration and
environment-specific build selection remain outside this generator. See the
[Config generation notes](../../docs/typescript-migration/p1-config-generation.md).

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

The Service/Model parser accepts explicit `export default`, default-exported declarations,
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
application dev processes. Use `watch` or re-run `generate` after adding, renaming,
or removing sources; use `check` in CI. Generated declarations target the TypeScript 3.9-era syntax floor;
application dependencies may impose a newer compiler requirement.

## Watching declaration inputs

```sh
node /path/to/packages/think-ts-helper/cli.js watch . --models --configs --interval 500
```

`watch` uses the same flags and generation/ownership rules as `generate`. The
optional `--interval` is a whole number of milliseconds from 10 to 2147483647;
the default is 500. It is not accepted by generate/check.

```js
const {watch} = require('think-ts-helper');
const watcher = watch({root: process.cwd(), models: true, configs: true, interval: 500});
watcher.on('diagnostic', diagnostic => {
  // {severity: 'error' | 'warning', code, message}; never executes business code.
  console.error(diagnostic.message);
});
watcher.on('update', result => {
  // result.changed / result.removed are generator-owned output names.
  // result.recovered is true on the first success after a later failure.
});
try {
  await watcher.ready; // first successful full generation; or use the 'ready' event
  // It is now safe to begin separate semantic checking / development startup.
} catch (error) {
  // Initial failure rejects readiness and closes the watcher.
  throw error;
}
// When development stops, release the timer and output reservation:
watcher.close();
```

- `watch()` returns immediately. Its `ready` Promise and one-time `ready` event
  follow successful initial generation, including owned stale-declaration
  cleanup. Invalid options or a duplicate active output throw synchronously.
  A differently spelled alias whose directory does not yet exist can instead
  reject readiness before its first write. Closing before readiness rejects
  with `WATCH_CLOSED`.
- Initial generation failure emits a diagnostic, rejects readiness and closes.
  The CLI exits 1, even when old declarations exist. After readiness, failures
  retain the generator's existing output behavior and polling continues. A
  repeated identical failure is reported once until success or a different
  failure. The first subsequent success emits `update`, even if no output bytes
  changed. Warnings are also deduplicated while their set remains unchanged.
- Add/delete/rename, module-layout changes and export/member changes are found
  by full regeneration on each poll. This includes enabled Model/Config/Extend
  inputs and system defaults read from the installed ThinkJS package. No mtime
  cache can hide equal-timestamp edits. Method types still reference original
  source; the application TypeScript service/checker observes those edits.
- Polls are scheduled after the previous synchronous generation finishes, so a
  session never overlaps work or accumulates a timer backlog. Edits between
  polls coalesce naturally. Unchanged output is neither rewritten nor reported
  as an update. This is correctness-first **full-scan polling**, not incremental
  analysis or a production-scale performance guarantee. Generation blocks the
  current Node event loop; use the CLI/separate process for a busy dev runner.
- `close()` is idempotent and cancels future generation. The CLI closes on SIGINT
  and SIGTERM. It exits 0 when the last generation succeeded, or 1 if a later
  error is still unresolved. A recovery clears the CLI's failure status.
- One watch session per resolved output is allowed within a process, including
  detected case-insensitive aliases. Separate processes and manual `generate`
  calls still need caller coordination: this is not a cross-process lock or a
  multi-file transaction. Options are copied at startup; restart watch to change
  flags, sourceDir or outDir. The helper does not read a watch config or tsconfig.

**Ownership boundary:** disabling an opt-in when starting a new session removes
only the previous helper-owned optional declaration. Removed/renamed sources
also disappear from regenerated registries. No arbitrary user file, compiled
application JS, source map or copied resource is deleted. Runtime artifact
cleanup, semantic-check watch, application restarts and think-cli/think-watcher
wiring remain separate work. Do not treat ready/update as a passing `tsc` check.

Measure full-scan and change-detection costs separately:

```sh
node packages/think-ts-helper/scripts/benchmark.js 1000
node packages/think-ts-helper/scripts/benchmark-watch.js 1000
```

The watch benchmark reports readiness and add/rename/delete latency, including
the default poll delay but excluding compiler/app restart. It asserts no timing
threshold. See [the watch slice notes](../../docs/typescript-migration/p1-helper-watch.md)
for a measured baseline and remaining development-workflow gates.

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

## Optional Controller extension prototype

`generate({controllerExtends: true})` or `--controller-extends` additionally emits
`controller-extend.d.ts`. It composes with `--models` and `--configs`, but leaves
existing `AppController`/Logic adoption unchanged. The new
`AppExtendedController<T, M>` view adds the effective Controller members.

This bounded P1 slice reads only TypeScript static object exports. It inspects
`config/extend.ts`, followed by `extend/controller.ts`; multi-module apps use
only `common/config/extend.ts` and `common/extend/controller.ts`, exactly like the
loader. Module-local Extend files are not treated as overrides.

Supported configuration exports are a single `{controller: {...}}` object or an
ordered array of those objects with `as const` (a tuple is required to preserve
individual source types). Application extensions use `export default {...}` or
an unannotated `const` object with `export =`. Type-only imports and explicit
method `this` parameters are supported. The helper never executes source files,
getters, methods or plugin factories.

Example application extension:

```ts
interface ControllerHost {
  ctx: {module: string};
  prefix: string;
}
const controller = {
  prefix: 'hello',
  greet(this: ControllerHost, name: string) {
    return this.prefix + ':' + this.ctx.module + ':' + name;
  },
  get label() { return this.prefix + ':controller'; }
};
export = controller;
```

Opt in once in the application's BaseController. Declaration merging makes the
new members available without copying each method or emitting class fields:

```ts
import type {Controller, Context} from 'thinkjs';
import type {
  ControllerExtension, AppExtendedController, AppContext
} from '../../.thinkjs/types'; // adjust for the BaseController's location

export interface BaseController extends ControllerExtension {}
export class BaseController extends think.Controller {
  declare service: AppExtendedController<Controller, 'home'>['service'];
  declare ctx: AppContext<Context>;
}
```

With Model/Config generation enabled, retain their existing `declare model` /
`declare config` adoption fields and the module-aware Context view. These are
still type-only declarations. This fixture is checked with `strict` /
`noImplicitThis` and both class-field emit modes. Getter-only properties remain
readonly; paired accessors retain writable source types. Use an independent host
interface for an extension's `this`, rather than importing its own generated
view and creating a circular type dependency. A method/getter that needs host
members not present in its inferred source object must describe that host
explicitly; the helper does not invent a contextual `this` type.

Effective properties reference their source with `Pick<typeof import(...), ...>`.
An overridden key comes only from the winning layer, never an intersection of
incompatible signatures. Every override produces a
`CONTROLLER_EXTEND_OVERRIDE` diagnostic (API `diagnostics`, CLI stderr), even if
it is compatible. This is conservative reporting, **not** a semantic
compatibility proof; normal `tsc` checks source and consumer types afterward.

Boundaries:

- Only Controller extension types are generated. Other extension targets,
  imported plugin values/factories, runtime imports, JS/JSDoc sources, numeric
  or computed member syntax, spreads, top-level mutation and shape-changing
  assertions/annotations are diagnosed rather than guessed. Quoted numeric
  string keys are supported. Numeric literal keys are not.
- System Controller members, instance `ctx`, and `model` are protected from
  override so this slice cannot invalidate existing lookup contracts.
- A setter without a getter cannot describe safe reads and is rejected.
  Data-over-accessor and partial accessor overrides that would retain an old
  getter/setter are also rejected: the runtime copies descriptors and is not
  equivalent to object spread. Complete getter/setter-pair replacements work.
- `ControllerExtension` is for an explicit application BaseController, not a
  global augmentation or a promise about Logic, plugins, subclasses or objects
  that replace those members at runtime.
- Disabling this option removes only the helper-owned
  `controller-extend.d.ts`. Check mode stays read-only, and source errors leave
  previous output unchanged. Concurrent/multi-file output transactions remain
  outside this prototype.

This does not complete P1 or provide automatic typing for all Extend targets.

## Checked development prototype

`require('think-ts-helper/development').createWatcher(TrackedWatcher, typescript)`
provides an opt-in Application watcher that generates declarations, checks and
emits one complete TypeScript project, tracks JS/map/imported-JSON cleanup, then
requests one worker reload per successful batch. Checking and emission use the
same supplied compiler and project, not `transpileModule`.

See [the setup, supported tsconfig and failure boundaries](../../docs/typescript-migration/p1-checked-development.md).
Set `APP_PATH` explicitly and do not run a parallel helper/runtime watcher.
This currently full-compiles on every poll, reusing unchanged parsed syntax,
and is not transactional output publication. It remains a private correctness prototype, not a new CLI template
or a declaration that the P1/P2 development workflow is complete.


### Measuring checked development

`pnpm --filter think-ts-helper benchmark:development 1000 5 single` measures a
1,000-service project using the real generated Service contract and semantic
consumer. Use `multi` for common/home/admin overrides. JSON output records
compiler loading, cold checking, unchanged polls, edits, failure/recovery,
rename cleanup, CPU time, peak RSS and syntax-cache work counts.
Set `THINKJS_AUDIT_TYPESCRIPT` to another installed compiler's package directory
to compare compilers without changing the lockfile.

See [the measurement contract and limitations](../../docs/typescript-migration/p2-compiler-syntax-cache.md).
There is no portable wall-time SLA or automatic phase-completion assertion.
