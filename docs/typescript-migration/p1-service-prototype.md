# P1 first slice: generated Service contracts

This draft is stacked on P0 commit `51bdb25dfe70393ccd5fcfa27bdacae0464eefc6`
([#1796](https://github.com/thinkjs/thinkjs/pull/1796)). It advances
[#1795](https://github.com/thinkjs/thinkjs/issues/1795) without marking the whole
P1 stage complete. No existing runtime or `thinkjs/index.d.ts` declaration is
changed, and no package is published.

> Follow-up: [Service adoption bridge](p1-service-adoption.md) resolves the
> Context/Controller boundary limitation described below. This page records the
> first slice; the follow-up changes only those legacy Service signatures.

## What is implemented

- `thinkjs/service-types` is a type-only opt-in subpath. Its mergeable
  `ServiceModules` registry records actual service export types. The reserved
  `__single__` map describes single-module apps; multi-module maps use their
  runtime module names, including `common`.
- Private `think-ts-helper` generates `.thinkjs/types/service.d.ts`, `index.d.ts`
  and a deterministic manifest from source without executing business code.
  Source references preserve constructor parameter and instance/object types.
  The CLI supports `generate` and read-only `check`.
- Effective module maps preserve nested names, common fallback and local
  overrides. Tests compile the same source into CommonJS and compare the
  generated maps with the real loader.
- `ThinkServices<Base, Layout, Mode>` and `ContextServices` share the global
  call signature. `ControllerServices<Base, Layout, CurrentModule, Mode>` has a
  separate signature for runtime argument reinterpretation. Generated
  `AppThink`, `AppContext` and `AppController` aliases select the detected layout.
- Known service names validate constructor arguments. Strict mode rejects
  unknown literals; compat mode accepts unknown names as `unknown`, retaining
  validation for known constructors. Broad `string` lookup returns `unknown`.

The generator has pinned TypeScript 3.9.10 solely for source parsing. This does
not select the future framework source compiler or change `think-typescript`.
The lockfile adds one importer that reuses the existing 3.9.10 resolution.

## Using the prototype

See the [helper README](../../packages/think-ts-helper/README.md) for the API,
supported exports, diagnostics and output ownership contract.

```sh
node /path/to/packages/think-ts-helper/cli.js generate /path/to/application
node /path/to/packages/think-ts-helper/cli.js check /path/to/application
```

Include `.thinkjs/types/**/*.d.ts` in the application's tsconfig; enable
`allowJs` to infer JavaScript services. Import the generated view as a type:

```ts
import type { Think } from 'thinkjs';
import type { AppThink } from './.thinkjs/types';

const app: AppThink<Think> = think;
// Generated service names, return types and constructor arguments are checked.
```

The real Think integration fixture verifies this assignment without an `as`
assertion or a hand-written registry. The generated single/multi consumer
fixtures are semantically compiled and then executed against the real runtime.
The generator does not replace ambient `think.service` globally: callers must
use the opt-in view to obtain strict checks.

## Important call semantics and conservative limits

1. Multi-module `think.service` and `ctx.service` default to common, including a
   Context whose request module is admin. Their explicit `undefined`/`null`/empty
   module placeholder retains the global common default.
2. A Controller defaults to its known current module. A recognized module in
   argument two is consumed as a selector. Any other argument is passed to the
   constructor, including `undefined`. To pass the string `admin` to a
   constructor, select the module explicitly first, for example
   `controller.service('example', 'admin', 'admin')`.
3. Unknown/union Controller module identities cannot make strict implicit calls.
   Union service names or module selectors must be narrowed first. This avoids
   accepting constructor arguments that fit only one possible runtime branch.
   A truly broad string lookup is intentionally `unknown`.
4. Ordinary objects remain objects, including CommonJS objects with a `default`
   property. Only syntactic ES default exports select `.default` in generated
   references. Nonconstructable function exports are excluded from known lookup
   names because the runtime cannot load/construct them safely.
5. Legacy Context/Controller declarations incorrectly restrict argument two to
   a string. Directly assigning those legacy values to every new view is not yet
   possible without a boundary assertion. Tests use typed injection for these
   two entry points. This is an explicit remaining adoption decision, not a
   claim that full legacy Controller subclasses now typecheck without changes.
6. The standalone new contract is checked with `strict: true` and
   `skipLibCheck: false`. The fixture importing old `thinkjs` declarations still
   uses the P0 `skipLibCheck` workaround for unrelated declaration errors. A
   passing prototype does not repair the legacy declaration tree.

Parser restrictions and unsupported dynamic/mixed export forms produce
diagnostics. Generated files are atomic individually, not as a multi-file
transaction. Concurrent generators targeting the same directory are not yet
supported. Adding/removing/renaming a source updates declarations on the next
generation; the helper does **not** delete stale compiled application JavaScript.

## Reproduce validation

```sh
pnpm install --frozen-lockfile
pnpm run test:typescript-migration
pnpm --filter think-ts-helper test
pnpm lint
pnpm test
git diff --check
```

To repeat the type and generated-consumer suite using another already installed
compiler, set `THINKJS_AUDIT_TYPESCRIPT` to that compiler's absolute package
directory and run `node --test --test-concurrency=1 test/typescript-migration/*.test.cjs`.
This does not change the parser dependency or the lockfile.

Local validation was performed on Linux, Node 24.22.1 and pnpm 11.6.0. TypeScript
3.9.10 and 5.9.3 exercise positive and `@ts-expect-error` cases. The local install
uses the existing offline dependency cache, not a cold network installation.
Final local results:

- Frozen-lockfile offline installation passed; no new resolution was downloaded.
- Migration suite: 28/28 passed (including the 6 inventory checks).
- Helper suite: 17/17 passed, included in the root workspace run.
- Alternate TS 5.9.3 suite: 22/22 passed (migration runtime/type tests, excluding
  the compiler-independent inventory checks).
- Root lint and test passed: 70 package test scripts, 1,317 passing Node tests
  including the root migration suite, 7 existing TODOs, and one legacy Mocha test.
- `git diff --check` passed. `npm pack --ignore-scripts --dry-run` confirmed
  `service-types.d.ts`, `lib/application.js` and `lib/extend/context.js` are in the
  ThinkJS file list; this is not an installed-tarball acceptance test.

Upstream CI is checked separately for the remote PR head.

The helper's reproducible benchmark generates 1,000 simple services. One local
run measured 67 ms initial generation and a 26 ms median across five unchanged
runs. This is an observation on this machine, not a portable SLA or CI budget.
The README includes the command; no timing threshold is added to CI.

## Remaining P1 and next batches

- Review and choose the legacy Context/Controller adoption bridge before freezing
  public names. Model/Config module generics are not implemented by this slice.
- Prototype Controller extensions with `this`, getters and descriptor-sensitive
  overrides. Do not infer their behavior from Service maps.
- Review the separate foundation/debounce source and pack pilot in
  [#1791](https://github.com/thinkjs/thinkjs/pull/1791).
- Verify source add/remove/rename together with compiled application output,
  full app startup and installed tarball consumption. Helper declaration
  regeneration alone does not satisfy that acceptance gate.
- Select and pin the source compiler/consumer matrix and performance budget.
  Watch/ready, build cleanup, CLI/template wiring, project semantic checks and
  robust serialized multi-file generation remain P2 work.

The root test's existing Memcached/MongoDB exclusions remain unchanged. This
slice does not claim their integration tests, Windows or the Node 20 minimum
have passed locally. Those P0/P5 gates remain open.
