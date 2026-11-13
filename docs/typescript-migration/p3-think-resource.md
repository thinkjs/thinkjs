# P3: think-resource TypeScript migration

This bounded production package migration is part of #1795. It branches directly
from #1811 at `457be4430dc0a4c1c307714c42854613b7874022`; it does not depend on the
application/helper stack or the sibling debounce, instance, gc, qs, router-rest or
config migrations. It is not completion of P2, P3 or the overall migration.

## Preserved runtime and packaging contract

- The unchanged `koa-send` 3.3.0 dependency owns filesystem access, decoding, path
  confinement, streaming, gzip, cache headers and errors. This change does not
  implement a new static server or alter that dependency's security behavior.
- The root `index.js` remains the CommonJS entry and forwards to generated `lib/index.js`.
  The exported factory stays anonymous and constructible, and returns `serve`.
  Existing `require` and root deep imports have identical function identity. Native
  ESM default import observes that same CommonJS function; no `exports` map is added.
- `think-helper.extend` retains its lodash recursive merge, inherited properties,
  cloned arrays/objects, default treatment of undefined, and accessor read order.
  The module default object and caller options remain independent as before.
- String routes retain segment-prefix matching; repeated path slashes, empty route
  segments, regexp state and custom regexp matching are not rewritten. `publicPath`
  is never stripped from the path passed to `koa-send`.
- GET and HEAD use send; other methods delegate. Unmatched next return values and
  synchronous errors stay synchronous and preserve identity. Matched requests discard
  send's filename and adopt downstream only on a falsy send result with captured
  `notFoundNext`. Thrown/rejected errors remain the same objects.
- Versions, runtime dependency ranges and Node >=20.19.0 are unchanged. Only the
  package's dev-dependency importer adds existing locked `@types/node` 25.8.0.

## Source, types and builds

Strict CommonJS TypeScript extends the shared foundation. Build/typecheck/clean and
forced prepack generate JavaScript, declarations and both map types. The explicit
package whitelist includes all source-map targets but excludes tests, compiler state
and configuration. The source root shim and generated declaration shim preserve the
old public entry without install-time compilation.

Untyped debug and koa-send have small build-only declarations. Existing think-helper
is a declaration boundary, with a localized assertion around its broad extend return.
There is no new `any` in the implementation or public declarations.

The structural context includes the operations used by koa-send; it is not merely a
path/method placeholder. It accepts Koa-shaped overloaded header setters. Header
callbacks receive a useful structural response/Stats contract and deliberately allow
bivariant explicit Node annotations without forcing ambient Node declarations on
all consumers. Richer custom callback properties are not guaranteed. The middleware
models ordinary promise adoption with a TS3.9-compatible single-level unwrap; deeply
nested hand-built thenables are a documented modeling limit. Call and construct
factory signatures are both provided.

## Gates

`pnpm --filter think-resource test` builds first, checks without emission, lints and
runs the original 25 HTTP tests plus migration tests. Original assertions use
`node:assert/strict` rather than the newer `t.assert`, so they run on Node 20.19.0.
The migration suite covers:

- A hash-pinned byte-for-byte legacy source fixture; deterministic differential
  option, route, access-order, return, error and callback checks.
- Real Koa HTTP differential checks for HEAD, fallthrough, unmatched methods/routes,
  `maxAge`, custom headers and streaming alongside all inherited HTTP scenarios.
- Cold builds, no-emit output stability, native clean/rebuild, output deletion with
  remaining incremental metadata, and semantic-error prepack refusal.
- Exact tarball contents, CommonJS/native ESM identity, real installed-file streaming,
  both map targets and full installed declaration checking on TS3.9.10/5.9.3 with
  positive and negative consumers. Removing negative directives must produce errors.
- An additional current-compiler test with actual Node response/Stats annotations.

Installed acceptance first copies each resolved runtime dependency into an isolated
source directory using ordinary byte copies, then runs npm pack with scripts disabled
and installs real tarballs offline. This breaks pnpm store hardlinks without changing
package contents or manifests: npm's bundled node-tar can otherwise deadlock on the
combination of external store links and internally repeated hardlinked files (see
[node-tar #460](https://github.com/isaacs/node-tar/issues/460)). The fixture graph has
no bundled dependencies; their installed node_modules directories are excluded, and
new bundled dependencies fail explicitly until their packaging is handled.

A regression package reproduces both hardlink patterns, checks that staging produces
independent files with identical bytes, verifies the exact archive, and installs it
offline before checking every file again. npm errors retain their package directory
and final debug-log lines before temporary-fixture cleanup. The package under test
still exercises its real prepack lifecycle; only dependency repacks disable scripts. Flat exact overrides keep multiple `ms`
versions distinct without editing published manifests. This is installed-artifact
acceptance, not live registry-resolution testing. The ordinary declaration consumer
has no workspace links, TypeScript or Node ambient dependency. The separate optional
Node-annotation check explicitly supplies the maintainer's real Node types.

The shared foundation coverage configuration includes TypeScript implementations,
so c8's `exclude-after-remap` filter retains this migrated source instead of silently
dropping it behind the old JavaScript-only include.

## Minimum Node CI and integration

The minimum-runtime workflow adds `--filter think-resource...` to the Node24
script-free frozen install, retains foundation source/lint gates, then executes
compiler and runtime tests directly under Node20.19.0. pnpm11 itself cannot run on
Node20. Original HTTP tests need the package working directory, so the workflow
changes there before running both test files.

This PR and sibling migrations extend the same workflow. When integrating them,
retain every package's install filter and build/type/runtime tests, plus the foundation
fixture gate and Node24 tooling → Node20 runtime split. Full-workspace scripts keep
the inherited Memcached/MongoDB exclusions. Platform and remote-CI results must be
reported separately from local Linux validation. No merge, release or npm publish
is part of this migration.
