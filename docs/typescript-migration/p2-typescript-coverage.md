# P2: aggregate coverage for migrated TypeScript packages

## Failure and fix

The root c8 report uses source maps and `exclude-after-remap: true`. The previous `.c8rc.json` included only `packages/**/*.js`, so a generated `lib/index.js` was remapped to `src/index.ts` and then rejected by the include rule. The thin compatibility `index.js` could still appear covered while the production implementation disappeared from LCOV.

Include both `packages/**/*.js` and `packages/**/*.ts`. Keep `all: true` and remap-time filtering enabled: a package with no execution must remain visible with zero coverage, and mapped tests must not enter the report. Explicitly exclude `packages/**/*.d.ts` and `packages/**/*.test.ts`, alongside the existing JS-test and test-directory exclusions. Apply the existing ESLint/webpack config exclusions to their `.ts` equivalents as well. Declarations are not executable production code and must not dilute coverage.

This is one shared rule for migrated packages, not a growing per-package allowlist. It does not exclude generated JavaScript indiscriminately: legacy JS packages still need it, and source maps are responsible for reporting compiled code at its original TypeScript location. A migrated package without valid source maps is still a package-build error; the include change cannot repair its maps.

The existing `packages/think-model/src/**` exclusion is intentionally unchanged because it currently excludes duplicate legacy source. When think-model itself migrates, revisit that exception and verify its canonical production source appears in LCOV. This change does not claim coverage for ESM/TSX layouts outside the current migration contract.

## Reproducible gate

```sh
pnpm test:typescript-build
# Focused test, using the already-installed maintainer dependencies:
node --test test/typescript-build/coverage.test.cjs
```

The gate creates an isolated workspace, compiles real TypeScript with the shared build config, executes the emitted JS through a compatibility shim, invokes the installed c8 CLI with the actual root `.c8rc.json`, and reads the resulting LCOV. It does not stub `shouldInstrument` or accept a successful c8 exit as proof of source coverage.

It asserts the exact source-file list, including:

- Executed TypeScript has a hit on the exercised return line and function.
- The unexercised branch remains zero-hit.
- Entirely unexecuted TS and JS files remain present with zero-hit lines under `all: true`.
- Legacy JavaScript and the compatibility shim remain visible.
- Generated JS and original TS do not create duplicate implementation records.
- Declaration files, generated declarations, test directories, executed `*.test.ts` modules, and TS ESLint/webpack configs are absent after remapping.
- The existing think-model duplicate-source exclusion remains effective.

The test clears an inherited `NODE_V8_COVERAGE` before starting its own isolated compiler/c8 subprocesses. Its files and report directories are temporary, so running the gate inside root `pnpm coverage` does not inject synthetic package records into the real aggregate report. It runs with the existing root test glob and the minimum-Node workflow; no new dependency or CI job is needed.

## Integration

The same `src/index.ts` ← `lib/index.js.map` layout is used by the think-instance (#1812), think-gc (#1813), think-qs (#1814), think-router-rest (#1815), think-config (#1816), and think-resource migrations. They should inherit this shared configuration. Remove any narrower package-specific TypeScript include added solely as a workaround, while preserving package-specific runtime/build tests.

Coverage percentages can decrease when previously invisible, unexecuted TypeScript becomes part of the denominator. That is expected and should not be hidden by disabling `all`, excluding entire TS source directories, or dropping source-map remapping. Per-package coverage and an aggregate report are distinct checks; inspect the aggregate LCOV for the source path rather than relying on package-only summaries.
