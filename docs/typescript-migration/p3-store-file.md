# P3: think-store-file source migration

This is an independent production-package slice of #1795, based on the shared
build, lint and coverage foundation in #1811. It does not include the other
production-package migration branches and does not complete P3.

## Runtime and package contract

- `src/index.ts` is the implementation. The shared strict CommonJS build emits
  `lib/index.js`, declarations, JavaScript maps and declaration maps.
- The existing root constructor export, `index.js`, extensionless imports and
  dynamic-import default interop remain. No `exports` restrictions are added.
- `index.d.ts` forwards the generated declaration. `lib/index.js` is an additional
  compiled entry, not a replacement for an existing deep path.
- Build/typecheck/clean and forced prepack follow #1811. Generated files are
  ignored in Git. Maintainers must build before running a fresh source checkout.
- The tarball contains root entries, emitted files, sources, README, LICENSE
  and package metadata. Tests, tooling and incremental metadata are excluded.
  Included TypeScript sources make both map formats resolvable after installation.
- Runtime dependencies, package version and Node minimum are unchanged.

All filesystem operations still use the original `helper.promisify` wrappers
with the original receivers. This migration does not replace them with
`fs.promises`, change callback scheduling, or rewrite the retry algorithm.
Concurrent reads of the same normalized path share the module-level Debounce
instance, including calls from different FileStore instances. Empty reads retry
three times with 10 ms waits; the fourth empty result is returned. Other read
failures retry and preserve the final rejection. Missing files skip get, append,
delete and info. Delete alone ignores an ENOENT unlink race. The mutable
`storePath` and symbol-based path helper retain their runtime shape. The internal
symbol and its method are stripped from declarations, so structural consumers do
not have to implement an inaccessible key.

The existing path check compares string prefixes and follows filesystem
symlinks. It is **not a security boundary** and is not tightened in a source-only
migration. Continue to supply trusted storage paths. `set` still calls
`helper.chmod` without a mode and returns its boolean result; this may be false
on current Node even after the write succeeds. These inherited behaviors are
covered rather than silently fixed.

## Declaration contract

The previous declaration returned `Promise<any>` for every method. Generated
signatures now describe actual outcomes:

- `get`: `Promise<string | undefined>`.
- `set`: `Promise<boolean>` for the helper chmod result, accepting strings and
  ArrayBuffer views, including Buffer.
- `delete`, `append`, `has`: `Promise<void>`. `has` resolves on access and rejects
  on failure; it does not return an existence boolean.
- `info`: `Promise<fs.Stats | undefined>`.
- `append` accepts strings and ArrayBuffer views, including Buffer. `storePath` is a mutable string.

Code that depended on the old `any` returns may need missing-value checks or
corrections. Consumers supply Node declarations compatible with their compiler.
The installed fixture checks TS 3.9.10 with @types/node 8.10.66 and TS 5.9.3 with
@types/node 25.8.0, with strict checking and `skipLibCheck: false`. The older type
package is a declaration-parser compatibility fixture, not a Node 8 runtime
support claim. The package runtime remains Node >=20.19.0. There is no new
runtime @types dependency. Legacy helper callback and debounce types are
narrowed locally; no public `any` is introduced.

## Validation

```sh
pnpm install --ignore-scripts --frozen-lockfile
pnpm --filter think-store-file test
pnpm lint
pnpm coverage
```

The package gate covers original runtime tests, a byte-for-byte legacy fixture,
controlled differential I/O and debounce behavior, actual filesystem operations,
cold build/no-emit/clean, deleted-output recovery, prepack refusal on type errors,
exact tarball membership, an offline script-free real dependency installation,
CommonJS/deep/default-import identity and positive/negative declaration checks.
The dedicated LCOV gate executes the production package and requires one mapped
`src/index.ts` record with line/function/branch hits and no generated-JS duplicate.
The root coverage report is checked separately.

The minimum-Node workflow installs with Node 24 because pnpm 11 requires a newer
runtime, then invokes build/typecheck and gates directly on Node 20.19.0. When
integrating sibling migrations, combine their package filters and validation
steps in this workflow rather than replacing this package's gate.

No merge or npm publication is part of this change. External-service exclusions
in the existing root test command are unchanged. macOS and Windows are not
claimed as locally tested; remote CI is reported separately for the exact head.
