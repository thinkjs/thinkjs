# P1 checked development coordinator

This next slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795) stacks on
[#1806](https://github.com/thinkjs/thinkjs/pull/1806). It adds an explicit development
watcher that coordinates declaration generation, project checking, compiler
emission, tracked cleanup and one application worker reload per successful batch.
It does not complete P1/P2 or change existing templates.

## Why a separate opt-in entry

The existing `think-typescript` transpiler is intentionally a fast per-file
`transpileModule` path. A separate semantic checker could use different compiler
options or a different TypeScript version. Even matching them does not make
per-file emission equivalent to project emission: const-enum consumers and
compiler-option changes can require recompiling unchanged sources.

`think-ts-helper/development` exports `createWatcher(TrackedWatcher, typescript)`.
The application supplies both dependencies explicitly. The returned watcher uses
**one TypeScript program** for diagnostics and emission; it does not invoke
`think-typescript` or run an independent helper watcher. The compiler write hook
collects outputs in memory before any runtime output writes. The tracked watcher
then records those actual outputs, including source maps and imported JSON.

```js
const path = require('node:path');
const Application = require('thinkjs');
const {createWatcher} = require('think-ts-helper/development');
const DevelopmentWatcher = createWatcher(
  require('think-watcher/tracked'),
  require('typescript')
);
const application = new Application({
  ROOT_PATH: __dirname,
  APP_PATH: path.join(__dirname, 'app'), // explicit, including first clean start
  watcher: DevelopmentWatcher,
  watcherOptions: {
    root: __dirname,
    project: 'tsconfig.json',
    interval: 500,
    declarations: {models: true, configs: true},
    onError: error => console.error(error.code, error.message)
  }
});
application.run();
// The lifecycle owner closes application.watcherInstance on shutdown.
```

This replaces the watcher/transpiler pair for the opted-in application. Do not
start the standalone helper watcher or a second compiler over the same output.
Production still starts emitted JS without helper, watcher or compiler.

## Supported application contract

- One non-overlapping source/output pair, with explicit matching `rootDir` and
  `outDir`, CommonJS and normal `.ts` application sources. `APP_PATH` must be
  explicit because the legacy Application fallback selects `src` when no
  transpiler or existing `app` directory is present.
- The tsconfig must include `.thinkjs/types/index.d.ts` (or the configured
  declaration directory). Every runtime source must occur in the checked
  program, including sources reached through imports.
- `declarations` accepts the existing generator flags and declaration `outDir`.
  The coordinator supplies the source/project root and always generates first.
  Declaration and runtime output directories must not overlap.
- Imported JSON is compiled and tracked. Unimported JSON, general resource
  copying, `.js`/`.es`/`.tsx`/`.mts`/`.cts`, declaration emission, project
  references, incremental/composite builds and `outFile` are not supported.
  Unsupported selected inputs/configuration fail rather than being silently
  emitted without checking.
- `noCheck` is rejected, including with TypeScript 5.9. `noEmit` is deliberately
  overridden in this explicitly opted-in development command after diagnostics
  pass. Other supported compiler options, including `strict` and `skipLibCheck`,
  keep their configured meanings. This is not a promise to override a user's
  chosen type-checking strictness.
- Declaration discovery still uses the helper's TypeScript 3.9 syntax parser;
  supplying a newer project compiler does not remove that documented syntax
  floor or broaden the generators' static-analysis limits.

No dependency ranges, versions, lockfile or package-publication policy change.
The helper remains a private prototype. Wiring it into externally downloaded
CLI templates before release/version policy is settled would create an unusable
registry dependency, so CLI/template adoption is deferred.

## Ordering, failures and lifecycle

Each serialized poll performs generation, config parsing, full semantic checking,
and project emission into memory. Compiler diagnostics are labelled
`DEVELOPMENT_CONFIG`, `DEVELOPMENT_TYPECHECK` or `DEVELOPMENT_EMIT`.

The coordinator validates output ownership/path mappings and destinations, then
queues the entire checked source snapshot through the tracked watcher. It sends
one `event: 'build'` callback only after all writes and cleanup succeed. Application
recognizes this completed-build event, skips per-file transpilation and uses its
existing worker reload path. Legacy watcher callbacks are unchanged.

The fingerprint covers compiler options, emitted contents and all program
source/declaration texts. Config changes, imported JSON, const-enum dependencies
and ambient declaration edits therefore re-emit the whole supported application.
An identical successful poll makes no runtime output writes and requests no reload.

Initial failure throws before application loading and closes the watcher. The
same retained watcher can restart. Later errors are deduplicated through the
tracked watcher's `onError` and retried. A failed batch remains dirty, including
when the source is subsequently reverted to the last successful fingerprint.
Closing during a batch suppresses its reload; final callback failure also retains
the dirty state for retry. Final callbacks must be synchronous.

Generation/semantic failures leave runtime outputs untouched and request no
reload. **Runtime output publication is not transactional.** A disk-write or
cleanup error can occur after some files changed, leaving partial new contents on
disk while the old worker runs. A worker crash/refork or lazy file load can see
that partial build. Staging and atomic publication are separate future work; do
not interpret the reload barrier as a last-good filesystem guarantee.

Destination preflight rejects symlink paths. A before/after source scan catches
ordinary edits during checking, and emitted bytes come from the checked compiler
program. This is not an atomic filesystem snapshot of all configuration,
declaration and dependency files or protection from hostile concurrent mutation.
Use one writer for source/generated/runtime directories.

Output cleanup inherits #1806's session-scoped ownership. Unknown old outputs
are not adopted or deleted. Start with an intentionally owned clean build
directory; pre-existing matching compiler outputs can be overwritten. Ownership
survives close/restart of the same object, not a new process. Persisted manifests,
cross-process locks and safe initial cleanup remain open.

## Cost and acceptance

This correctness prototype performs a full check and emit-to-memory even on idle
polls. It does not yet use incremental compiler/watch APIs or dependency caches.
The default interval is 500 ms **after** work completes, not a total latency
promise. `lastCheckDurationMs` records the latest successful check; `lastBuild`
contains `durationMs`, `compilerVersion`, emitted files and generator warnings.
Large applications should not adopt this polling strategy without measurement.
Performance budgets and incremental scheduling remain a P1/P2 gate.

Focused tests cover semantic failures before writes/deletes, declaration/runtime
coverage, config changes, const-enum consumers, JSON, single-batch rename,
cleanup refusal, failed partial emission followed by source reversion, final
callback failures, early close/restart, modern `noCheck`, source mutation during
checking, timer recovery/deduplication and symlink destinations.

The isolated installed-tarball application gate exercises a real clustered HTTP
application with this coordinator and verifies semantic-error no-write/no-reload,
recovery, JSON updates/removal, one-reload rename, source-map configuration
changes, deletion and independent production-only startup. It also retains the
legacy runtime-watch acceptance from #1806.

Validation results and the measured installed-fixture durations are recorded in
the PR. Alternate Node versions, Windows/macOS/case-insensitive filesystems,
external database/cache services and arbitrary resource copying are not inferred
as passing from this Linux acceptance.

## Validation record

Linux / Node 24.22.1 / pnpm 11.6.0:

- Root `pnpm lint` and `pnpm test` passed: 1,489 passing Node tests, seven
  inherited TODOs, one inherited case-sensitive-volume skip, and one passing
  legacy Mocha test across 70 package test scripts.
- All 13 development-coordinator regressions passed with TypeScript 3.9.10 and
  5.9.3, including `noCheck` rejection. The Application completed-build callback
  regression passed, and independent review found no remaining blocker.
- Fresh installed-tarball gates passed with both compiler versions, including
  actual clustered HTTP, JSON updates/removal and separate production-only
  installations. No workspace node_modules or copied installed dependencies
  satisfied these gates.
- On this small installed fixture, successful TS 3.9 builds took 800 ms initially
  and 229–468 ms for subsequent updates. TS 5.9 took 1,343 ms initially and
  284–496 ms subsequently. These are samples, not budgets: they exclude waiting
  for the next poll and worker restart, and other validation ran concurrently.
- Inventory, syntax and whitespace checks passed. Workspace checks reused the
  existing dependency installation and a writable CLI fixture HOME/template
  cache, with pnpm's pre-run auto-install disabled. Installed gates used fresh
  consumers and the existing offline package cache.

Node 20/22/26 and Windows/macOS were not run locally. Existing Memcached/MongoDB
exclusions remain. Remote CI is checked separately for the PR's exact head.
