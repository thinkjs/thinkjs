# P1 tracked runtime-output watch

This slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795) stacks on
[#1805](https://github.com/thinkjs/thinkjs/pull/1805). It adds an opt-in runtime
cleanup/reload path. It does **not** finish the full application dev coordinator.

## Audit and scope

The existing `think-watcher` entry compares filename stems in `srcPath` and
`diffPath`. It removes unmatched output files without an ownership record, does
not include `.js.map` in its default filter, and does not notify the application
when a source is removed. As a result a removed Service can remain in a worker's
loaded registry. Changing this behavior globally would silently change existing
applications' cleanup assumptions.

`require('think-watcher/tracked')` is a separate opt-in watcher. The legacy entry
and its tests remain unchanged. The new watcher:

- Uses the existing synchronous watcher constructor/callback shape, with content
  hashes rather than mtime-only source detection. It ignores declarations and
  hidden paths, and refuses symlinked source trees.
- Adds `event: 'change' | 'unlink'` and a synchronous `onEmit(relativeFiles)` hook
  on change events. Only explicitly reported, existing regular output files
  become eligible for deletion. `think-typescript` reports its JS and optional
  map after successful transpilation; its normal return value remains `true`.
- Validates every owned file's bytes and filesystem identity before deletion.
  Symlinked components, modified/replaced files, path traversal, overlapping
  source/output roots and conflicting output ownership are refused. If one file
  in a deletion group conflicts, no other member is removed during that attempt.
- Cleans an owned JS/map pair before notifying unlink. The existing Application
  reload path skips transpilation of removed source and reloads workers only
  after cleanup. Failed synchronous transpilation does not trigger reload.
- Retries later failed scans/callbacks and reports deduplicated errors through
  `watcherOptions.onError` (or stderr). Initial failure throws and leaves no timer.
  `watch()` and `close()` are idempotent; restarting the same object retains its
  ownership records. Application retains `watcherInstance` for explicit cleanup.

Example, after an intentional clean initial build:

```js
const Application = require('thinkjs');
const app = new Application({
  ROOT_PATH: __dirname,
  watcher: require('think-watcher/tracked'),
  watcherOptions: {onError: error => console.error(error)},
  transpiler: [require('think-typescript'), {
    compilerOptions: {module: 'commonjs', target: 'es2018', sourceMap: true}
  }]
});
app.run();
// Your process/lifecycle owner must close app.watcherInstance on shutdown.
```

A custom synchronous transpiler must call `config.onEmit` with exactly the
relative output files it successfully emitted, before returning. A successful
emit report that stops producing a previously owned map also cleans that map,
subject to the same checks. A saved emit hook cannot be called after the callback
returns or after close. Return `false`/Error or throw on failure. Promise-returning
callbacks/transpilers are unsupported and rejected, not awaited.

## Ownership and safety boundaries

Ownership is **session-scoped deletion accounting**, not a new write policy. The
transpiler still writes its configured output files, including overwriting a
pre-existing file with the same name. Do not point it at hand-maintained files.
The first scan recompiles all selected sources, even if an existing output is
newer, so emitted files can be reported. Unknown output files, including stale
files from previous processes, are never adopted by filename matching or removed.
Use an intentionally owned clean build directory when starting a new session.
A persisted compiler manifest and safe initial build ownership remain follow-up
work; closing/restarting the same watcher object does preserve its ledger.

No source tree may overlap any output tree. Missing source roots fail the scan
rather than authorizing mass deletion; nested directory deletion is supported.
A caller that changes an owned output after emission must remove it or restore
the original file before cleanup can continue. Files already missing are safe to
skip. Empty directories are left behind. These checks prevent ordinary accidental
cleanup, but do not claim atomic protection from hostile concurrent filesystem
mutation between validation and unlink. One process must own these directories.

Custom filters must be stable for a session: excluding a previously watched
source counts as removal. Output ownership does not survive process restart and
there is no cross-process or duplicate-instance writer lock. No new package
version, dependency range, lockfile, template, merge or publication is included.

## Acceptance

The installed-tarball application gate now also packs think-watcher and
think-typescript and installs them in an isolated consumer. It pins the
transpiler's TypeScript to the gate's selected compiler version. With real
clustered Application workers and HTTP requests it exercises:

1. Add a Service, obtain its value through a new Controller, and observe updated
   helper declarations and a real emitted source map.
2. Introduce a syntax error, keep the last working response, then repair it and
   observe the new response after reload.
3. Rename the Service, verify old JS/map removal, new runtime lookup and missing
   old lookup, together with updated helper declarations.
4. Modify the emitted map externally and delete the source. Verify cleanup is
   refused, owned JS remains, and the old worker keeps serving its value. Remove
   the conflicting map and verify cleanup/reload recovers and lookup is missing.
5. Preserve an unrelated JS file, rerun the semantic compiler, close both watchers,
   perform a clean build, and boot the separate production-only installation.

Helper watch and runtime watch run independently in this gate. There is no claim
that helper readiness or successful `transpileModule` is a semantic check, or
that reload waits for successful semantic checking. A final real `tsc --noEmit`
checks the settled fixture. Per-file reload can briefly expose an intermediate
rename/batch state. Coordinated generation/check/emit/restart, incremental
compilation, resources, CLI/templates and performance budgets remain open.

## Validation record

On Linux / Node 24.22.1 / pnpm 11.6.0:

- Root `pnpm lint` and `pnpm test` passed: 1,475 passing Node tests, seven
  inherited TODOs, one inherited case-sensitive-volume skip, and one passing
  legacy Mocha test across the existing 70 package test scripts.
- Tracked watcher tests: 21 passed; combined legacy/tracked watcher suite: 42
  passed. Transpiler emit reporting and Application lifecycle/reload regressions
  also passed.
- Fresh installed-tarball application gates passed with TypeScript 3.9.10 and
  5.9.3, including live clustered runtime watch, real semantic checking and
  separate production-only installations.
- Independent review completed; pending-emission recovery, cross-root ownership,
  callback failure handling and initial watcher retention received regressions.
  Inventory, syntax and whitespace checks passed.

Workspace checks reused installed dependencies and a writable CLI fixture
HOME/template cache, with pnpm pre-run auto-install disabled. The first offline
application attempt lacked metadata for the newly exercised line-column
transitive dependency. An online installation populated that package cache;
subsequent final gates used fresh consumers and the offline cache. No workspace
node_modules or copied installed dependencies satisfy those gates.

Node 20/22/26, Windows/macOS and actual case-insensitive filesystems were not
exercised locally. Existing Memcached/MongoDB exclusions remain. Remote CI is
reported separately for the PR's exact head.

The focused watcher suite covers cleanup before notification, nested removal,
rename, unchanged and backwards timestamps, unknown files, edited/replaced
outputs, symlink redirection, cross-root overlap, failed-first-emit deletion,
error/Promise callbacks, later recovery, late reports and repeated watch/close.
Node/OS versions not exercised locally and inherited service exclusions must not
be inferred as passing from these focused checks.
