# P3: think-gc source migration

This slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795) depends only on
[the shared build foundation #1811](https://github.com/thinkjs/thinkjs/pull/1811).
It does not include or depend on the debounce pilot, think-instance migration
#1812, or the application/helper stack. It does not complete P2, P3, or the overall
migration, and does not publish a new version.

## Why this package

`think-gc` is a small production timer/collection utility used by file storage,
cache and session packages. Its workspace dependency is the existing
`think-helper`; `debug` and the unchanged `think-ms` dependency are external.
It has no dependency on think-instance and no project-reference cycle. Existing
helper declarations form the build boundary; its source is not migrated here.

## Compatibility contract

- Keep `main: index.js`, add a thin CommonJS shim and a corresponding root type
  shim, and compile the implementation with `export =` into `lib`.
- Preserve the version, dependencies, runtime return value and public function
  shape. Do not introduce an `exports` map that restricts deep imports.
- Preserve module-wide registration state, the first timer's step, per-collector
  divisors, duplicate registration and inherited-name suppression, callback
  truthiness, live instance properties, method receivers and uncaught errors.
  `Reflect.set` retains silent failed registry assignments under strict emission.
- Do not normalize duration edge cases or await callback results as part of a
  language migration. The frozen differential baseline is byte-for-byte
  `packages/think-gc/index.js` from foundation #1811 (master `aa9cdde`).
- Keep strict checking without source `any`. The local debug declaration models
  only the debug 2.x factory used by this package. It is a build-only boundary and
  is not referenced by the generated public declarations. Node ambient types are
  also build-only. Public declarations need no extra packages or ThinkJS globals.

## Build and tests

Package scripts opt into the foundation's build, no-emit check, source lint,
clean and forced prepack. The tarball whitelist includes the unchanged root
entry, root declaration, generated JS/declarations/maps, source, README and
license. Tests and incremental metadata stay out of publication.

The existing two real-timer tests run against the compiled implementation.
Migration gates add deterministic comparisons with the legacy source, process
exit with an unreferenced real timer, cold build/no-emit/clean, recovery from
missing outputs, refusal to pack semantic errors, and an exact package-content
check. Actual runtime dependencies and the package are packed locally and
installed offline with scripts disabled, without workspace links. Installed
CommonJS/deep imports, native ES import, source maps and declaration maps are
checked; positive and negative consumers run under TS 3.9.10 and 5.9.3 with
`skipLibCheck: false`. Removing the negative markers must produce diagnostics.

The foundation's minimum-runtime workflow now also installs think-gc and its
workspace dependency, then builds/checks/tests it directly under Node 20.19.0.
Installation uses Node 24 because pnpm 11 itself requires Node >=22.13. The
existing root matrix continues to exercise the package on Node 22/24/26. A
configured matrix is not evidence that remote CI passed; see the PR for executed
checks and known environment limits.

When combining with #1812, preserve both packages' filter and validation steps
in `.github/workflows/typescript-build.yml`. Both independently fix the tool/runtime
separation in the same foundation workflow. The root scripts do not change.
