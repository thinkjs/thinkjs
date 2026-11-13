# TypeScript migration: staged implementation

The first reviewable implementation batch for [#1795](https://github.com/thinkjs/thinkjs/issues/1795) established the P0 compatibility baseline in [#1796](https://github.com/thinkjs/thinkjs/pull/1796). The next batch adds the [P1 Service prototype](p1-service-prototype.md): an opt-in type-only contract and a private generator. The follow-up [P1 Service adoption bridge](p1-service-adoption.md) repairs the legacy Context/Controller constructor-argument signatures and validates typed application base classes without casts. Runtime implementations, entry points and publication behavior remain unchanged. These batches do not complete the migration or the whole P1 stage.

The [P1 installed-application gate](p1-installed-application.md) now checks a real
pack/install/build/HTTP path and a second runtime-only installation, alongside
the bounded Model/Config/Controller Extend slices. P1 remains incomplete.

## Fixed baseline and scope

- Source baseline: [`aa9cdde600db87c332e5c98f704024e1a66788f4`](https://github.com/thinkjs/thinkjs/commit/aa9cdde600db87c332e5c98f704024e1a66788f4).
- Audit run: 2026-11-13, Linux, Node 24.22.1, pnpm 11.6.0.
- 73 package directories, 72 unique package names. The workspace root is orchestration, not a library. One template submodule is tracked separately.
- `think-logger` and `think-logger3` both declare the name `think-logger3`. The inventory preserves directory identity and flags ambiguous edges; it does not delete or rename either package.
- The declared runtime graph contains `think-loader` ↔ `thinkjs`. Do not turn this into circular TypeScript project references.
- Existing draft [#1791](https://github.com/thinkjs/thinkjs/pull/1791) is the `think-debounce` pilot. It is not merged into this baseline and is not reapplied here.

## Deliverables

- [Package inventory](packages.json): entry points, declarations, scripts, publication whitelist, direct/reverse workspace candidates, external first-party-looking dependencies and a migration responsibility for every directory.
- [Dependency graph](dependencies.mmd): runtime/optional versus development/peer edges, with aliases and ambiguous package names identified.
- [Runtime contracts](runtime-contracts.md): Service, Model, Config and Extend behavior tied to executable fixtures.
- [Types and toolchain](types-and-toolchain.md): declaration drift, old TS/JS workflows, template boundary and compiler evidence.
- [ADR 0001](adr-0001-compatibility.md): entry points, type ownership and strict/compat migration decisions.
- [Validation record](validation.md): commands, results and unresolved service/matrix checks.
- [P2 compiler syntax reuse](p2-compiler-syntax-cache.md): content-validated parsing reuse, compiler invalidation tests and generated-contract performance reports, without skipping semantic checks.
- [P2 local checked starter](p2-local-template.md): real CLI template generation, portable local package installs and explicit checked dev/build scripts, without changing published defaults.
- [P1 checked development](p1-checked-development.md): one-program generation/check/emission and batch worker reload, with explicit compiler/configuration and publication boundaries.
- [P1 tracked runtime watch](p1-runtime-watch.md): session-owned JS/map cleanup and failure-aware reload without altering the legacy watcher.
- [P1 helper watch](p1-helper-watch.md): readiness, declaration updates, diagnostics and lifecycle, without claiming runtime artifact ownership.
- [P1 installed application](p1-installed-application.md): isolated tarball installs, strict application compilation, real clustered HTTP requests, and production without development tools.
- [P1 Service adoption](p1-service-adoption.md): no-cast legacy boundaries and type-only Controller/Logic base classes, checked against generated single/multi-module applications.
- [P1 Service prototype](p1-service-prototype.md): generated registries, strict/compat contracts, real compiler/runtime checks and remaining adoption decisions. The current inventory includes the new private helper (74 package directories, 73 unique names); the fixed P0 source baseline above remains historical.

## Reproduce

Use the repository-pinned pnpm 11.6.0 and install the unchanged lockfile:

```sh
pnpm install --frozen-lockfile
pnpm run audit:typescript-migration
pnpm run test:typescript-migration
pnpm run lint:typescript-migration
pnpm lint
pnpm test
```

The audit needs only Node and runs before dependency installation. `test:typescript-migration` also checks generated inventory drift. The root `test` and `lint` commands explicitly include the new checks, so existing CI executes them. Fixtures deliberately characterize existing behavior; passing them does not mean old declarations are correct.

The audit records *declared candidate edges*, not installed resolution. In particular, a dependency range may select a registry version despite a same-name workspace package. Do not use this graph alone as a build order. The proposed P3/P4 batches describe responsibility, not permission to skip P1/P2 or ignore dependency order. CLI/transpiler workflow integration remains P2 even where full source migration is assigned a later batch.

When the workspace changes, update the audit's explicit classification, regenerate its outputs, and review the diff. Do not silently classify a new package as migrated. Examples and legacy-review packages have explicit treatment but are not assumed safe to publish.

## Corrections to the planning issue

1. **Controller service calls are not Context service calls.** `think.service` and `ctx.service` use the global common default. `controller.service` can infer the current module and reinterpret argument two as a constructor argument unless it equals a registered module name. P1 must model separate call signatures. Changing runtime behavior to fit the original draft would be a separate compatibility decision.
2. Config supports existing dotted lookup/set syntax, and array merging preserves trailing base elements. Generated types must describe those rules rather than invent flat-only or replacement semantics.
3. Context/Controller model calls can select an explicit model module while retaining config/cache from the context's module.
4. Getter/value extension overwrites are descriptor-sensitive. A blanket “last member always wins” type intersection/override model is insufficient.

## Stage gates

| Stage | State after this batch | Next acceptance work |
| --- | --- | --- |
| P0 | Executable behavior/dependency/type baseline implemented; external-service and alternate-runtime checks explicitly open | Review the corrected semantics and compatibility ADR; run the recorded independent integration commands |
| P1 | Bounded dynamic-type prototypes, installed application gates, and opt-in checked development flow implemented; existing debounce pilot remains separate | Review the supported contract, full-project polling cost, publication boundaries and remaining compatibility/performance gates before declaring P1 complete |
| P2 | Development/watch and local template prototypes; broader infrastructure incomplete | Strict shared build configuration, incremental scheduling beyond syntax reuse, transactional runtime publication, persistent ownership, resource copying and registry-facing CLI/template integration |
| P3 | Not started | Migrate the audited dependency groups without altering CommonJS shapes/deep paths |
| P4 | Not started | Data/adapters/official ecosystem and remaining generators, with service-backed tests |
| P5 | Not started | Complete old/new application matrix, performance, package installation and release review |

Do not infer that a stage is complete from an unchecked planning item or a passing transpilation. A broad ecosystem migration has no credible duration estimate until the P1 type/overload and generation experiments pass. This batch does not merge, publish, deprecate packages, or edit the planning issue.
