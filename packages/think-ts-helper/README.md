# think-ts-helper (private P1 prototype)

An **opt-in Service-only** declaration generator. It does not change ThinkJS
runtime loading, build applications, remove compiled output, watch files, or
implement the whole TypeScript migration plan. This package is private and is
not published.

From an application root in this workspace:

```sh
node /path/to/packages/think-ts-helper/cli.js generate .
node /path/to/packages/think-ts-helper/cli.js check .
```

Both commands accept `--source-dir src` and `--out-dir .thinkjs/types` (paths
relative to the application root). `check` exits 1 when generated content is
missing/stale; it never writes. Invalid input and conflicts also exit 1, with a
diagnostic on stderr.

```js
const {generate} = require('think-ts-helper');
const result = generate({root: process.cwd(), sourceDir: 'src', outDir: '.thinkjs/types'});
// result.changed: output names whose bytes differed
// result.manifest: stable source paths and effective per-module service maps
// generate({...options, check: true}) computes differences without writes.
```

Include `.thinkjs/types/**/*.d.ts` in the application's tsconfig. For JavaScript
service inference enable `allowJs`; enabling `checkJs` is optional. Generated
`index.d.ts` exports `AppThink<T>`, `AppContext<T>`, and
`AppController<T, ModuleName>` aliases for opt-in typed framework views. They
select the detected layout and strict literal-name mode. The base type `T` is
the application's existing ThinkJS/context/controller type. Existing ambient
ThinkJS declarations are not replaced. See `thinkjs/service-types` for the
underlying aliases and loose mode.

## Discovery and outputs

- Discover lowercase `.ts` and `.js` recursively in each `service` directory;
  ignore `.d.ts`, hidden files/directories, and other extensions. Sources are
  parsed with pinned TypeScript 3.9.10, never imported or evaluated. Nested
  `node_modules` directories are excluded. Symlink services are rejected.
- As in `think-loader`, the existence of `src/common/config` selects multi-module
  layout; all immediate source directories are modules, including `common`.
  Otherwise use `src/service`. `__single__` is reserved for single-module maps.
- Nested names use `/`. Multi-module effective maps merge common services first,
  then local overrides. Duplicate `.ts`/`.js` names, case-only name collisions
  (including effective common/local collisions), and module case collisions
  are rejected before writing.
- `.thinkjs/types/service.d.ts` augments `ServiceModules` with
  `typeof import('../../src/...')` references for CommonJS/export-assignment
  sources, and `.default` selections for syntactic default exports. This keeps
  CommonJS objects with a property named `default` intact. `manifest.json` lists sorted effective name-to-source mappings;
  it contains no timestamps or absolute paths. `index.d.ts` imports the registry
  and exports layout-specific aliases.
- Output replacement is atomic **per file** (temporary sibling + rename), not a
  transaction across all three files. Unchanged files are not rewritten. Existing
  output files must carry this generator's marker; unowned files are never
  overwritten. Other files are never deleted. Do not run concurrent generators
  with different configurations against the same output directory.

## Boundaries

The parser accepts explicit `export default`, default-exported declarations,
`export =`, and top-level `module.exports`/`exports.name` assignments. It rejects
named-only ES exports, export lists/re-exports, mixed export styles, conditional
or nested CommonJS export assignments, and `__esModule` interop markers with
`UNSUPPORTED_EXPORT`. Prefer one explicit service export. Application source
syntax must be parseable by TypeScript 3.9.10. The application compiler still
checks imports and dependencies and infers actual service shapes; the helper
does not emit or execute application code. Dynamic export manipulation and
transpiler-specific interop outside these source forms are unsupported. Runtime
deployment still needs the existing application build process.

Output must be outside the source directory. Symlink output ancestors are
rejected. Point the generator at a real application source directory rather
than a symlink tree.

The generator does not own the application tsconfig, build output, lockfile, or
watcher. Re-run `generate` after adding, renaming, or removing services; use
`check` in CI. Generated declarations target the TypeScript 3.9-era syntax floor;
application dependencies may impose a newer compiler requirement.

## Tests

```sh
node --test packages/think-ts-helper/test/*.test.js
```

Tests cover byte stability, stale checks, add/remove/rename, nested TS/JS,
non-execution, layout detection, common overrides, collisions, ownership, and
CLI behavior. Compiler and runtime-parity integration tests live with the
workspace's TypeScript migration tests.

A local synthetic benchmark is available (includes parsing and generated-file
comparison, excludes process/compiler startup and initial fixture creation):

```sh
node packages/think-ts-helper/scripts/benchmark.js 1000
```

Example on Node v24.22.1 in the development container: 1,000 simple TS service
files, initial generation 67 ms, median unchanged generation across five runs
26 ms. These are local observations, not a portability guarantee or CI gate.
