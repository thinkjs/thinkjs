# P3: think-router-rest source migration

This is one package slice of #1795, based directly on #1811's build foundation
(remote commit `58ab88a12dd1720abf3be82cbe301282d48febf8`). It does not depend on
or duplicate the debounce, instance, gc, qs, or application/helper branches.
The larger P2/P3 stages and full migration remain incomplete.

## Runtime compatibility boundary

- Retain `main: index.js`, CommonJS and the existing `think-router-rest/index.js`
  deep path, with an anonymous, nonconstructible factory and middleware.
- Preserve required options, falsy constant-name fallbacks, factory snapshots,
  controller classes/objects, inherited property lookup, and module selection.
- Preserve missing registry errors and truthy REST flags. No new fallback to
  common or normalization of method/constant names is introduced.
- Custom query methods only apply to exact `POST` and `CLI` methods. Query and
  flag getters retain their original number/order of reads. Overrides are not
  validated or coerced; their original `toLowerCase` call and receiver remain.
- Preserve action assignment before `next`, setter/proxy receivers and errors,
  silent failed writes on read-only contexts, and exact downstream returns,
  throws and rejected promises. Strict CommonJS emission uses `Reflect.set` to
  preserve the old non-strict assignment behavior.
- Do not change package version, runtime dependencies/ranges, Node minimum,
  lockfile or exports policy. No ESM conversion, merge or publication.

The generated public type surface uses structural context/options boundaries and
propagates `next`'s return type. Controller registries and HTTP query objects remain
open objects because static flags and query values are dynamic. Private casts
model property access without adding runtime validation. Types intentionally
reject invalid documented inputs such as missing/null options or numeric HTTP
methods, while runtime tests preserve legacy handling of such JavaScript values.
The private debug declaration describes only the used factory and is not exposed
through the generated public declarations. Node/debug ambient types are not
required by installed consumers.

## Build, package and acceptance gates

The package uses the shared strict config, generated JS/declaration maps, an
explicit package whitelist, and a forced checked prepack. A byte-for-byte legacy
fixture supports differential behavior tests. Tests run against compiled JS.

The migration gates cover cold build, no-emit checking, clean/rebuild, recovery of
deleted outputs with surviving build metadata, and refusal to pack stale JS after
a semantic error. Tarball installation is offline and script-free, using real
runtime dependency tarballs with consumer-local overrides rather than workspace
links or rewriting published package manifests. This validates installed output,
not live registry resolution.

Installed consumers check root/deep CommonJS and native ES default import,
exact artifact contents, resolvable source maps and full declaration checking on
TS 3.9.10/5.9.3. Positive and negative cases cover options, structural controller
classes and module registries, dynamic query shapes, context requirements,
nonconstructibility and downstream return inference. Removing negative-case
markers verifies the errors are real.

The minimum-runtime workflow installs tools under Node 24 (pnpm 11 needs Node
>=22.13), then runs tests directly on Node 20.19.0. The existing root Test matrix
also executes package tests on Node 22/24/26. When combining independent package
PRs, retain each package's install filter and validation commands in this workflow.
The root suite's inherited Memcached/MongoDB exclusions are unchanged.
