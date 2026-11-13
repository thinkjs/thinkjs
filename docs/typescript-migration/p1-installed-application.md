# P1 installed application acceptance

This slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795) stacks on the
Service, Model, Config and Controller extension prototypes. It adds a runnable
multi-module application and a package-manager acceptance gate. It does not
complete P1, migrate framework implementation sources, or publish packages.

## Run the gate

```sh
pnpm run test:typescript-application
THINKJS_APPLICATION_TYPESCRIPT=5.9.3 pnpm run test:typescript-application
```

Alternatively, `node scripts/typescript-migration/application.cjs` runs without a
workspace dependency install. Node, npm and pnpm 11.6.0 must be on PATH. The
script uses only Node built-ins before installing the application. CI runs it
in separate clean Linux jobs (Node 22 / TS 3.9.10 and Node 24 / TS 5.9.3).
These are selected compatibility versions, not a claim about the latest TS.

The gate:

1. Packs the 22 first-party packages in the fixture's runtime/build dependency
   closure using real `npm pack --ignore-scripts`. This respects each package's
   published file rules, including new public declaration subpaths and existing
   ThinkJS deep imports. It packages the checkout's current JS artifacts; it is
   not a replacement for each package's build/tests.
2. Creates a temporary application outside the workspace and uses real
   `pnpm install --ignore-scripts`. Tarball overrides cover all first-party
   dependencies, including the `thinkjs` / `think-loader` cycle. The known legacy
   duplicate `think-logger` directory is excluded in favor of the active
   `packages/think-logger3` path used by the workspace lockfile. New ambiguity
   fails rather than silently choosing a package.
3. Resolves the installed first-party dependency graph and asserts its files
   stay inside the consumer. There are no workspace symlinks, `NODE_PATH`, TS
   `paths` aliases, or copied `node_modules`. Internal package-manager links are
   allowed. CommonJS bootstrap and existing deep paths must remain usable.
4. Runs the installed helper CLI, checks missing/stale declarations, verifies
   that `check` does not write, builds using real project-wide `tsc`, and tests
   negative source contracts. Removing the five `@ts-expect-error` directives
   must produce five source diagnostics, and the build must reject them. JSON
   data is emitted with the app. Add/rename/delete a Service through full
   rebuilds and verify declarations and emitted JS change together.
5. Starts the normal `Application.run()` production master and one real cluster
   worker on an ephemeral localhost port. HTTP assertions cover successful MVC
   dispatch, Logic rejection before Controller, and a missing Controller's 404.
6. Installs a second application with only runtime dependencies and copies only
   compiled `app/` and the JS startup file. It asserts source files, generated
   types, `think-ts-helper` and TypeScript are absent/unresolvable, then starts
   the same production process and repeats the HTTP assertions.

External dependencies resolve their declared ranges in each fresh consumer,
independently of the workspace lockfile; this is a packaging compatibility
smoke test, not a frozen-lockfile application release. Lifecycle scripts are
disabled. Registry access is normally required. Existing caches can be used via
`THINKJS_APPLICATION_STORE_DIR` and `THINKJS_APPLICATION_CACHE_DIR`; setting
`THINKJS_APPLICATION_OFFLINE=1` fails if required metadata/artifacts are missing.
Neither offline mode nor cache reuse is claimed to be a cold download.
Temporary directories and test-owned server processes are cleaned up on exit.

## Application and coverage

The fixture is in `test/typescript-migration/application-fixture`. Its normal
scripts show explicit prepare-types, semantic check, build and JS-only start.
The gate supplies unpublished packages using tarball overrides; the fixture
cannot currently be installed from the public registry as-is.

- Controller and Logic bind their actual `admin` module once with type-only
  base declarations. No business casts or handwritten project registry are
  used. `useDefineForClassFields: true` ensures these annotations do not shadow
  inherited methods.
- The Controller calls a typed Service with a real custom Model instance.
  Runtime assertions cover common/local Service and Model overrides, Context
  Service's common default, module Config types, and unregistered table fallback.
- Model activation uses the ordinary `think-model(think.app)` plugin. Custom
  Model methods read emitted JSON data. The fixture's adapter throws if a DB
  connection is requested; this is **not database/query/adapter acceptance**.
- Config uses the generator's existing bounded static-object support. The
  application declares `think-config` directly as a build dependency because
  generated types import `think-config/config-types`; strict pnpm consumers
  cannot depend on transitive packages being visible at their own root.
- The existing framework declaration baseline still needs `skipLibCheck`.
  Application sources remain strict and every negative case is proven by an
  actual compiler error. This does not claim full legacy declaration validation.

## Explicit remaining boundaries

The real Model plugin in `config/extend.ts` is not statically supported by the
Controller Extend generator. The gate verifies that adding `--controller-extends`
fails with `UNSUPPORTED_CONTROLLER_EXTEND` and does not corrupt existing output.
It does not turn unsupported plugins into apparently valid generated types.
The standalone Controller extension contracts remain covered by the preceding
slice's tests.

There is no dev watcher or new CLI/template integration here. Clean rebuilds
belong to this fixture only, not a new framework build API. Cache, Session,
View, external databases, arbitrary plugins, Windows process teardown,
performance budgets, and broader release matrices remain separate work.
The startup file adds only test IPC for readiness and shutdown; routing,
loading, extension activation and application startup use the actual framework.

The [helper watch follow-up](p1-helper-watch.md) adds installed-API Service
add/rename/delete checks to this gate. It watches declarations only; the
application build/cleanup and server lifecycle boundaries above still apply.
