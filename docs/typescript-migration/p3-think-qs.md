# P3: think-qs source migration

This production-package slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795)
bases directly on [#1811](https://github.com/thinkjs/thinkjs/pull/1811). It is independent
of the application/helper stack, the debounce pilot (#1791), and the instance/gc
migrations (#1812/#1813). It does not complete P3 or the full roadmap.

## Scope and runtime contract

- Move the implementation to strict TypeScript under `src/index.ts`. Keep the
  anonymous, nonconstructible CommonJS factory and middleware functions, their
  argument counts, root `index.js` entry, and existing `think-qs/index.js` deep import.
- Keep package name/version, Node requirement, qs dependency range, and all other
  dependencies unchanged. No new runtime dependency, exports restriction, ESM
  migration, middleware ordering change, publication, or framework-wide rebuild.
- Preserve defaults, shallow per-factory options snapshots, query/post flags,
  query-before-post ordering, and every read of the request/body properties.
- Keep the bracket-key detection and existing stringify/parse round trip exactly:
  parser settings are forwarded, but `qs.stringify` still uses its own defaults.
  Non-bracket post bodies retain their original identity. The body object itself
  is not replaced. `next()` is called synchronously and its result is returned
  unchanged; errors propagate without an async wrapper.
- Legacy CommonJS silently ignores failed assignments to frozen/read-only objects
  or a proxy whose set trap returns false. TypeScript emits strict mode. A boxed
  `Reflect.set` with the original receiver preserves these writes, primitive
  receivers, setter receivers, and thrown setter/proxy errors. The request is
  captured immediately before the write to preserve the number and ordering of
  getter calls, including changes made by parser callbacks.

The original implementation is stored byte-for-byte in the test-only legacy
fixture. Differential tests run both implementations against the same real qs
version. Existing qs parsing/security behavior is unchanged; this migration does
not make unvalidated nested HTTP input safe for database queries.

## Public declaration boundary

The factory accepts generic object options intersected with its own optional
boolean flags, so both object literals and interface-typed qs options work.
Version-specific parser options remain owned by qs. This migration does not claim
static validation of every qs setting. The internal `src/qs.d.ts` is a minimal
structural boundary for the untyped runtime dependency, not a public ambient type
installation or a copy of DefinitelyTyped. Generated declarations import neither
qs nor framework/global/Node types.

The request needs a query string when supplied; body and parsed `_query` values
are `unknown`. This reflects custom decoders and dynamic/unvalidated payloads.
The middleware's generic call signature returns exactly the type of `next()`.
Existing JavaScript behavior for malformed/primitive input is covered for parity,
without advertising every such input as a supported TypeScript API.

The maintainer compiler remains TS 5.9.3 from #1811. Full installed declaration
checking, with `skipLibCheck: false` and no ambient types, covers TS 3.9.10 and 5.9.3.
These are this package's tested consumer versions, not a framework-wide guarantee.

## Build and package lifecycle

Run from the monorepo with its pinned pnpm installation:

```sh
pnpm --filter think-qs build
pnpm --filter think-qs typecheck
pnpm --filter think-qs test
pnpm --filter think-qs clean
pnpm --filter think-qs pack
pnpm lint
pnpm test
```

The existing `test-cov` entry now builds before running the legacy and migration
suites. `prepublish` retains its validation behavior. `prepack` forces a checked
rebuild, including when incremental metadata survives but outputs were deleted.
A semantic error blocks packing even if stale compiled outputs exist. Build
artifacts live only in `lib` and `.build`; generated files are not checked in.

The tarball whitelist contains the root JS/declaration shims, compiled JS and
declarations with maps, source files, README, LICENSE, and npm package metadata.
Source files make both map formats resolve after installation. Test fixtures,
build cache, compiler config, and development dependencies are not published.
A cloned checkout needs its build before direct runtime use. Consumers install
already-built tarballs and do not run the maintainer build.

Native `tsc --clean` only removes currently configured outputs. It is not a stale
source-deletion tracker or a transactional multi-package build. Clean regression
checks ensure unrelated files and source are retained.

## Validation gates

- Existing tests still run against the compiled entry.
- Differential tests cover parsing flags/options/decoders, bracketed and primitive
  bodies, default isolation, getter/write ordering, identity, synchronous return
  values, promise identity/rejections, errors, frozen/getter-only/proxy writes,
  primitive request receivers, and callable CommonJS shape.
- Isolated source copies test cold build, no-emit checks, clean/rebuild, recovery
  after deleted output, and refusal to pack a semantic error.
- Cold prepack verifies an exact file list; a fresh consumer installs the package
  and its real dependency tarballs offline, with lifecycle scripts disabled.
  It verifies root/deep CommonJS and dynamic import, runtime behavior, map sources,
  and TS 3.9/5.9 positive/negative cases, including interfaces and invalid flags.
- The minimum-Node job installs tooling using Node 24 because pnpm 11 requires
  Node >=22.13, then directly executes the foundation/package gates on Node
  20.19.0. The existing Test workflow also runs package tests on Node 22/24/26.

Independent sibling migration PRs modify the same CI install/filter block.
When combining them, retain all enrolled packages and their verification steps.
