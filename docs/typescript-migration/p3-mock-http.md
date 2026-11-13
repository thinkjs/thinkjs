# P3: think-mock-http source migration

This independently reviewable package migration implements another part of
#1795 on the #1811 foundation (`457be443`). It does not require the other P3
package migrations, complete P3, merge a pull request, or publish a package.

## Runtime and entry contract

The implementation moves to strict `src/index.ts`, compiled as CommonJS with
both source and declaration maps. The existing root `index.js` remains a thin
entry forwarding to generated `lib/index.js`. Root/index deep imports keep
working; generated `lib/index` is available as well. There is no `exports` map,
`default` property, or ESM marker. The anonymous function retains its arity and
runtime constructibility. As with ordinary strict-mode compilation, deprecated
reflective `caller`/`arguments` properties are not preserved.

The original five tests remain unchanged. A byte-for-byte legacy implementation
from master `aa9cdde` is retained under test fixtures for differential checks:

- URL, query-string and JSON inputs, including boxed strings and repeated keys.
- Defaults and explicit `undefined` overrides.
- Shallow request cloning, loss of the original prototype, retained nested
  object identity, and exact supplied-response identity.
- Truthy injection selection, argument mutation/deletion, getters, inherited
  properties and symbol behavior. Argument symbols are omitted by `for-in`;
  symbols already copied from an injected request remain.
- Exact callback return/promise identity, callback receiver, thrown exceptions,
  falsy applications and invalid-input failures.
- `exitOnEnd` deletion, response-method replacement and `process.exit()` without
  forwarding a body. A real child process also verifies exit status zero.
- Frozen input/response objects, nonwritable inherited request fields and proxy
  delete traps. `Reflect.deleteProperty` and `Reflect.set` retain the original
  non-strict failed-write behavior despite the emitted module being strict.

This does not repair or sanitize the legacy request simulation. In particular,
JSON may inject arbitrary request/response values; this is not an HTTP validation
boundary, and the Readable transport is not a real network socket.

## Public types

Ordinary object arguments without request/response injection produce a Node
request and response pair. Request overrides are merged into the request type:
for example `{url: 42}` exposes a numeric URL, not a fictitious string. Only
string/number keys participate; symbol arguments are not copied. Named argument
interfaces work without an index signature. Open string-indexed bags cannot
promise an ordinary Node response.

Strings may contain JSON with injected values, and injected requests are plain
shallow copies. These cases return a conservative request property bag and an
`unknown` response. Narrow those values before use. This avoids falsely claiming
that a copied Node instance retains its prototype methods.

Ordinary object callbacks receive the request's applied type contextually.
At the dynamic string/injection boundary, callers provide their own annotated
handler input types; existing Node/Koa-shaped callbacks are accepted without
claiming runtime input validation. All app paths preserve their exact callback
result type. Constructor use remains a legacy JavaScript behavior rather than a
newly documented TypeScript API.

Consumers need Node declarations appropriate for their compiler/runtime. The
installed-tarball tests use real `@types/node@8.10.66` declarations for compatibility
with TS 3.9.10, then install `@types/node@25.8.0` and its dependencies
for the same cases under TS 5.9.3. These old declarations are
only a compatibility fixture, not a recommendation for new Node applications.
The implementation itself is checked with TS 5.9.3 and `@types/node@25.8.0`.
No new runtime dependency or version change is introduced. Neither tested TS
version establishes a framework-wide compiler support policy.

## Build, package and coverage gates

The shared build/typecheck/clean/forced-prepack contract is used unchanged.
Generated `lib` and build metadata are ignored. The package includes the root
entries, generated JS/declarations/maps, their TS source, README and license;
it excludes tests, build configs, caches and maintainer tools.

Tests build from cold sources, check without emitting, clean/rebuild, restore
removed output during prepack, and reject stale artifacts after a semantic
error. A packed target and its complete dependency graph install offline with
scripts disabled. Consumer tests validate require, index/deep imports, native
ESM interop, runtime behavior, maps and positive/negative compiler cases.

A production execution gate reads actual LCOV using the shared c8 configuration
and asserts one hit-bearing TS source record without generated-JS or declaration
duplicates. The full workspace coverage run remains a separate integration
check, with existing Memcached/MongoDB exclusions unchanged.

```sh
pnpm --filter think-mock-http test
pnpm lint
pnpm coverage
# After Node 24 tooling installation, run directly on Node 20.19.0:
node node_modules/typescript/bin/tsc -b packages/think-mock-http/tsconfig.build.json
node node_modules/typescript/bin/tsc -p packages/think-mock-http/tsconfig.build.json --noEmit
node --test --test-concurrency=1 packages/think-mock-http/test/index.js packages/think-mock-http/test/migration.test.cjs
```

When combining sibling P3 PRs, union their filtered-install package selectors
and minimum-Node validation steps rather than replacing one with another.
