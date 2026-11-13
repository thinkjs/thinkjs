# P2: shared package-build foundation

This is an independent infrastructure slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795), based on master `aa9cdde600db87c332e5c98f704024e1a66788f4`. It does **not** depend on the application/helper PR stack through #1810 and does not migrate a production package. P2 and the overall migration remain incomplete.

## Three separate compiler contracts

- Maintainer build and source lint: root `typescript` is exactly **5.9.3**, with `typescript-eslint` **8.72.2** supporting the existing ESLint 10 toolchain.
- Existing application transpiler: `think-typescript` retains `^3.5.3`, locked to **3.9.10**. It still performs single-file transpilation, not semantic project checking.
- Published declaration consumers: minimum versions must be decided and verified per package. The fixture declarations in this PR pass full declaration checking with TS 3.9.10 and 5.9.3; that is not a framework-wide compatibility guarantee. In particular, the separate [#1791 debounce pilot](https://github.com/thinkjs/thinkjs/pull/1791) uses `Awaited` and has its own TS 4.5+ consumer requirement.

The new root `tsconfig.base.json` supplies strict, no-emit-on-error CommonJS compilation, declarations, JS and declaration maps, consistent path casing, and full declaration checking. `types: []` avoids accidentally inheriting workspace test/global declarations. Packages using Node APIs must explicitly opt in to a chosen compatible Node ambient-type package.

It deliberately does not set root/output directories, ambient Node types, project references, incremental state, package entry points, exports, or publication lists. Existing JavaScript builds and runtime paths are not changed. There is no automatic workspace-wide `tsc` build, so adding the base config does not compile legacy JS or claim that unconverted packages have been checked.

## Reusable package example

`test/typescript-build/fixtures/{core,consumer}` are private, dependency-free test packages showing the contract. They are not workspace members and are never published. Their scripts provide:

- `build`: `tsc -b tsconfig.build.json`, including referenced dependencies in topological order.
- `typecheck`: `tsc -p tsconfig.build.json --noEmit`, after dependency declarations have been built. This can update TypeScript's incremental metadata, but emits no JS or declarations.
- `clean`: `tsc -b tsconfig.build.json --clean`, for currently configured compiler outputs and build information.
- `prepack`: rebuild before creating the tarball.

Package-level `tsconfig.build.json` extends the root base and specifies `src`, `lib`, a dedicated `.build/tsconfig.tsbuildinfo`, and `composite: true`. The consuming package explicitly references the core package config. The fixture aggregate references only the consumer; TypeScript discovers and builds its dependency first. Root/output directories remain a package decision: production packages may keep compatible `lib` layouts or use thin entry shims. Do not use a new output path to remove existing supported deep imports.

The example keeps the CommonJS single-function shape with `export =`, preserves the direct `lib/index.js` path, and publishes only `lib`, `src`, and npm's required metadata. Including `src` makes both source-map kinds resolve to real files after installation. A production migration must separately review whether its source files can be published, and include its README and license. Never add broad `exports` restrictions without reviewing existing deep imports.

The test copies these examples into a fresh temporary directory, adjusts the base-config reference, and creates normal workspace-style package links. It does not consume generated artifacts from this checkout. Copying only a fixture package is not a standalone project generator: its relative root config and sibling reference must also be adjusted. The fixture's pack lifecycle uses the repository's installed compiler; runtime consumers need neither it nor the build configuration.

## TypeScript source lint

`pnpm lint:typescript` applies the separate `eslint.typescript.config.cjs` to `packages/*/src/**/*.ts`. There are no enrolled production TS source packages on this base, so an empty match is intentional. A future package using a different source layout must add that layout or call the same config in its own lint script. Legacy JavaScript continues using the unchanged `eslint.config.cjs`.

The TS recommended rules reject explicit `any` and unused locals. Type-only syntax is parsed correctly; `import x = require(...)` and `export =` remain supported. Semantic type errors remain the compiler's job. Declarations and generated output are not source-lint targets. Any necessary transitional `any` still requires a localized explanation and follow-up rather than disabling checks for an entire package.

## Cycles and clean semantics

Project references are only appropriate for acyclic build groups. The regression gate verifies that a cycle fails with TS6202 before output is produced. Current runtime dependency cycles must not simply be mirrored into project references. Before enrolling such packages, select explicit checked-in/public declaration boundaries or a smaller independent build group; that policy and production enrollment are follow-up work.

The native TypeScript clean command is **not** an ownership-tracking or transactional directory cleaner. It removes the compiler outputs inferred from the current config. It does not promise to find orphan output from source files already deleted, preserve manual changes to generated files, or clear arbitrary directories. Use only dedicated compiler-owned output names, keep generated files unedited, and handle stale artifacts in each package's migration/pack design. The test verifies that unrelated files and source files survive. Build mode can build successful dependencies before a dependent fails; this is not an atomic workspace publication mechanism. `noEmitOnError` prevents invalid output for the package with errors, not rollback of earlier packages or old artifacts.

## Validation and commands

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm test:typescript-build
pnpm test
```

The focused gate checks:

1. Exact maintainer compiler pin and base-config invariants without changing the legacy application compiler.
2. Cold acyclic build order, CommonJS shape/deep path, semantic checks, and both map formats.
3. Stable incremental output, clean preservation of non-output files, and a subsequent cold rebuild.
4. Changed dependency declarations invalidate the dependent package.
5. A semantic error makes prepack fail even with stale output already present.
6. Semantic errors prevent package JS/declaration emission.
7. Cyclic references fail explicitly.
8. Cold `prepack`, exact tarball whitelist, offline script-free installation of both real tarballs, runtime require, source-map availability, and positive/negative installed declaration consumers on TS 3.9.10 and 5.9.3.
9. TS lint acceptance and rejection checks.

The gate is part of root `test`, so the existing Test workflow exercises it on Linux/Node 22, 24 and 26. A separate workflow covers the declared Node minimum **20.19.0** with a filtered, script-free dependency install. Tests require npm, already supplied with these Node distributions, but the tarball consumer installation is explicitly offline. Local validation results and untested platforms are recorded in the PR; a configured CI matrix is not evidence that it passed.

## Integration and next slices

This PR can be reviewed against master independently. Merging it with the #1796–#1810 stack requires combining the root package.json test/lint prefixes so **both** gate sets run; neither prefix may replace the other. The workflow is separate to avoid modifying that stack's application jobs. Existing lockfile importers/snapshots are preserved and only the new maintainer/lint dependency graph is added.

After this foundation is reviewed: adapt an actual small source-migrated package (prefer the existing #1791 pilot), decide its output/map/publication contract and consumer minimum, then enroll acyclic package groups. Production build orchestration, cyclic declaration boundaries, package-specific output ownership, and the rest of P2 remain open.
