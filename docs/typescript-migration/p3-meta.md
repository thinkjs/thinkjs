# P3: think-meta source migration

This is one independently reviewable package migration for #1795. It is based
on #1811's build/lint/coverage foundation (`457be443`) and does not require the
sibling instance, GC, query-string, router-rest, config or resource migrations.
It does not complete P3 or publish a package.

## Runtime and entry contract

`packages/think-meta/src/index.ts` is the strict TypeScript implementation.
`index.js` stays the CommonJS entry and forwards to generated `lib/index.js`.
Both the factory and returned middleware remain anonymous, nonconstructible
arrows. No `default`, `__esModule` marker or restrictive `exports` map is added.
The former root `index.js` deep path continues to work. Generated declarations
are available at the root and `lib/index` paths.

The migration deliberately preserves:

- `Object.assign` shallow copying, getter order, inherited-property exclusion,
  shared array values and explicit `undefined` overriding defaults.
- Timeout normalization through `think-helper.ms`, including original invalid
  duration failures. A non-function timeout callback disables timeout setup.
- The callback receives the context and shared normalized options. Its `this`
  is those options, and the callback property is re-read when the timer fires.
- Header emission and repeated `headersSent` checks before/after downstream work.
- Deferred `process.nextTick` logging, exact URL ignores and reading the current
  context fields when the queued log runs.
- Timing/logging discards successful downstream values. If both are disabled,
  `next()` is returned unchanged, including promise identity.
- Existing truthy rejection forwarding and falsy rejection swallowing. Synchronous
  downstream exceptions still throw synchronously. This migration does not fix
  or redefine those behaviors.

The frozen test fixture is copied from `aa9cdde`'s JavaScript implementation,
with only a provenance comment. Nine differential scenarios compare emitted JS
against that fixture with separate deterministic clocks and deferred queues.
The original seven runtime tests are unchanged.

## Public type contract

The callable export takes options (including `null` or `undefined`) and the
application. It exposes structural context/response/logger requirements, without
requiring a particular Koa or Node type package in consumers. Options can be
named with `Parameters<typeof meta>[0]`; middleware can be named with
`ReturnType<typeof meta>`.

Callbacks are context-generic: an explicitly annotated richer context narrows
the middleware's accepted context rather than promising fields on every request.
Callback options expose the normalized numeric timeout and callback receiver.
Other options remain optional because callers can explicitly override defaults
with `undefined`.

The supported typed downstream contract is a native `Promise<T>`, and its return
is conservatively `Promise<T | undefined>`. JavaScript's bypass path also retains
synchronous return values, but those are not advertised for the normal
promise-processing middleware path. Callback return values are ignored.

There are no new `any` declarations or suppressed semantic checks. Local
assertions preserve the existing helper-function boundary, callback re-read and
`ignoreUrl` access rather than adding runtime validation or coercion. Runtime
Node types are a pinned development-only dependency; generated declarations do
not import them or `think-helper` types. TS 3.9.10 and 5.9.3 are tested consumer
versions for this package, not a new framework-wide compatibility guarantee.

## Build, packaging and validation

- `build`, `typecheck`, `clean` and forced `prepack` follow the shared foundation.
  Generated `lib` output and build metadata are ignored by Git.
- The package whitelist contains the compatible entry, declarations, generated
  JS/maps, source-map source, README and license. It excludes fixtures, build
  configs, caches and development tools. Package version and runtime dependencies
  are unchanged.
- Cold source fixtures verify no-emit checking, clean/rebuild, recovery after
  generated files are removed, and refusal to pack stale output after a type error.
- A real tarball and its dependency graph install offline with scripts disabled.
  Dependencies are copied to detach pnpm hardlinks before packing, following the
  #1817 fixture correction. Published manifests are not rewritten. Installed CJS,
  dynamic import, deep paths and both maps are checked.
- Positive and `@ts-expect-error` consumer fixtures run under both compilers with
  full declaration checking and no ambient types. Removing the directives must
  produce diagnostics, proving the negative examples actually fail.
- A nested real c8 execution verifies one hit-bearing production TS LCOV record,
  including function/branch hits, with no generated-JS, test or declaration
  duplicates. The unchanged aggregate coverage config comes from #1811.
- Minimum-Node CI installs with Node 24/pnpm 11.6 and directly runs the build,
  shared infrastructure and package gates under Node 20.19.0. The root Test
  workflow runs the package on Node 22/24/26.

Commands from the repository root:

```sh
pnpm --filter think-meta test
pnpm lint
pnpm coverage
node node_modules/typescript/bin/tsc -b packages/think-meta/tsconfig.build.json
node --test --test-concurrency=1 packages/think-meta/test/index.js packages/think-meta/test/migration.test.cjs
```

When integrating sibling package PRs, keep each package's filtered install and
minimum-Node gates. This PR does not merge or publish any sibling changes.
