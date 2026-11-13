# P3: think-config TypeScript source migration

This independent slice of #1795 is based on the shared build foundation (#1811).
It does not depend on the other source-migration PRs or mark P3 complete.

## Compatibility boundary

- `src/index.ts` uses strict TypeScript. A CommonJS namespace emits exactly the
  existing enumerable `Config` and `getConfigFn` exports, with no `default` or
  `__esModule` property. The root `index.js` remains a forwarding entry.
- `Config` keeps the original data reference, dotted reads/writes, helper object
  checks, inherited-property access, setter chaining, and strict class-method
  errors. The existing special-key filter is preserved byte-for-byte; changing
  that security policy is outside this migration.
- `getConfigFn` retains single-module behavior, module selection and fallback,
  undefined-as-read, comma-separated writes, all-module writes, inherited
  enumerable module construction, and return values. No new runtime coercions,
  guards, defaults, caching or cloning are added.
- Public declarations use `unknown` for dynamic lookup values. They do not claim
  that construction-time shapes remain valid after arbitrary writes. Direct
  `Config.set` returns `this`; defined-value single-module writes return Config;
  multi-module writes return void. A possibly undefined value stays unknown.
- Source maps, declaration maps and the corresponding TS source are shipped.
  The package adds no `exports` restrictions or runtime compiler dependency.
  Root `*.d.ts` entries stay publishable, preserving the separate application's
  `think-config/config-types` contract when its stack is merged.

## Tests

The unchanged existing suite exercises the compiled entry. The migration suite
also runs against a byte-for-byte legacy fixture from commit 58ab88a12dd1720abf3be82cbe301282d48febf8:

1. CommonJS descriptors and constructor/function shape.
2. Falsy names, explicit read sources and unusual JavaScript arguments.
3. Dotted paths, inherited values and non-object traversal boundaries.
4. Reference identity, replacement rules, undefined writes and subclass chaining.
5. Existing special-key filtering without mutating global prototypes.
6. Read-only data, rejected proxy writes and propagated exceptions.
7. Getter/proxy access order and repeated nested reads.
8. Single-module ignored selectors and undefined-as-read.
9. Multi-module defaults, fallbacks, exact comma selectors and fan-out writes.
10. Inherited/non-enumerable/symbol modules, module snapshots and missing errors.
11. Getter ordering, duplicate writes and exception identity.

Build tests cover cold compilation, no-emit checks, safe clean behavior, deleted
outputs with retained incremental metadata, and type errors blocking prepack.
The packed consumer installs the real package and its dependency tarballs offline,
without scripts, workspace links or registry fallback. It verifies CommonJS,
dynamic import default interop, root/deep imports, maps and declaration sources,
and positive plus negative examples on TS 3.9.10 and 5.9.3. A separate packaging
regression keeps optional root declaration subpaths in the allowlist.

```sh
pnpm install --frozen-lockfile
pnpm --filter think-config test
pnpm lint
pnpm test
```

The dedicated minimum-Node workflow installs with Node 24 (pnpm 11 needs Node
22.13+) and then directly invokes the compiler and tests on Node 20.19.0.
The general Test workflow continues to cover Node 22, 24 and 26. Configured CI
is not evidence of passing results; see the PR for actual local and remote status.

## Combining parallel stacks

Merge #1811 first. Other independent package migrations also extend
`.github/workflows/typescript-build.yml`; combine their install filters and test
steps rather than replacing either. This PR does not change root test/lint
prefixes or the lockfile. The application-types stack separately adds
`config-types.d.ts` and README sections; retain those files/sections when resolving
a README conflict. The root runtime declaration does not import that optional
contract or globally augment application types.
