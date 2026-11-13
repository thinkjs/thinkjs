# P3: think-crontab source migration

This independently reviewable slice of #1795 builds on #1811 (`457be443`). It
migrates one scheduling package, without depending on the other P3 migrations,
completing P3, merging a pull request, or publishing a package.

## Runtime contract

The implementation moves from root `index.js` to strict `src/index.ts` and emits
CommonJS JavaScript, declarations, and both map formats into `lib`. The root
entry forwards the exact class export. Root/index deep imports continue working;
`lib/index` is also available. No `exports` map, default property, or ESM marker is
introduced, and the constructor remains a class with arity two.

The original eight runtime test bodies are retained. Their reload helper now
invalidates the generated module as well as the root compatibility entry so
module-level dependency mocks remain effective. A byte-for-byte copy of the
legacy source from master `aa9cdde` supports isolated differential tests for:

- String/object/array normalization, default task type, in-place mutation, shared
  references, and truthy enable filtering after normalization.
- Function handler receiver and application identity, URL capture, delayed
  application lookup, and ignored callback return values.
- `all` execution and every other type's `messenger.runInOne` path, including
  delayed callbacks, subsequent mutations, and synchronous exceptions.
- `appReady` registration, immediate-before-scheduling order, interval precedence,
  duration conversion, timer unref, exact task labels, and repeated registration.
- Unmodified cron string/Date/object forwarding to node-schedule.
- Missing-schedule errors, early abort of later entries, invalid inputs, and the
  class methods' pre-existing strict behavior on frozen objects.

This is not a scheduler redesign: there is still no task cancellation handle,
awaiting of handler promises, automatic rejection handling, deduplication on
repeated `runTask`, or validation of third-party cron objects. TypeScript does
not turn these legacy behaviors into runtime guarantees.

## Public types and dependency boundary

Generated declarations expose the constructor plus `Task`, `Options`, `Handler`,
and `NormalizedTask` types. Application types flow through the instance and
handler parameters. An omitted application is `undefined`; explicitly choosing
a nonoptional application type requires providing it. The normalized handle is
callable and its receiver is the normalized mutable task. Task type remains a
string because every value except `all` historically uses cluster dispatch.

An application only needs `on('appReady', ...)` for immediate tasks, and
`callback()` for URL handlers. These conditional runtime capabilities are not
invented as unconditional requirements on every application object. Cron objects
are forwarded rather than deeply typed or validated. Consumers need no ambient
Node types just to use this package's emitted declarations.

The implementation uses narrow local declarations for legacy untyped debug,
node-schedule, and think-mock-http operations. The existing think-cluster types
incorrectly extend the `NodeJS.EventEmitter` interface and omit the actual
`runInOne` method. A single structural require assertion isolates that boundary
until think-cluster itself migrates; `strict` and `skipLibCheck: false` remain.
These maintainer boundaries do not leak into the emitted public declarations.
No new runtime dependency or version change is introduced.

## Build, package and coverage gates

The shared build/typecheck/clean/forced-prepack contract is preserved. Generated
outputs and build metadata are ignored. Published files include the root
entries, generated JS/declarations/maps, their TS sources, README and license;
tests, build configs, caches and maintainer tooling are excluded.

Tests cover cold build, no-emit checking, clean/rebuild, reconstruction of deleted
outputs, semantic-error prepack refusal, exact tarball layout, an offline
script-free installed dependency graph, CommonJS/deep/native-ESM interop, and
source-map targets. Installed consumers run positive/negative cases under
TS 3.9.10 and 5.9.3 with strict checking and no skipped declarations. Neither
version establishes a framework-wide support policy.

A real c8 execution gate requires one hit-bearing `src/index.ts` LCOV record and
rejects generated-JS, test, or declaration duplicates. Full workspace coverage
is a separate integration check with the inherited external-service exclusions.

```sh
pnpm --filter think-crontab test
pnpm lint
pnpm coverage
# After installing tooling on Node 24, run directly on Node 20.19.0:
node node_modules/typescript/bin/tsc -b packages/think-crontab/tsconfig.build.json
node node_modules/typescript/bin/tsc -p packages/think-crontab/tsconfig.build.json --noEmit
node --test --test-concurrency=1 packages/think-crontab/test/index.js packages/think-crontab/test/migration.test.cjs
```

Combine sibling migration CI filters and package validation steps by union,
not by replacing one migration's steps with another's.
