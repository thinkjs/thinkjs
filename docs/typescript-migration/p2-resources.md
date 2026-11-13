# P2 checked non-code resources

This bounded slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795)
stacks on [#1809](https://github.com/thinkjs/thinkjs/pull/1809). It extends the
opt-in checked coordinator and repository-local starter, not the legacy
watcher, existing JS/TS templates, package versions or publication defaults.

## Selection and ownership

Pass `resourceExtensions: ['json', 'txt', 'html', 'bin']` to the watcher returned
by `think-ts-helper/development`. The option defaults to an empty list, preserving
the previous TypeScript/imported-JSON path. The local starter uses that example
list in `scripts/checked.cjs`, shared by staged build and dev. Restart dev after
changing it. Lowercase extensions without leading dots are matched exactly and
case-sensitively; duplicates are harmless.

Selected regular files below src retain their relative paths under app. Raw
resources preserve their bytes, including binary data and line endings. The
compiler continues to own imported JSON and its formatting; selected JSON that
is not imported is copied raw. Moving between these states retains a single
source/output owner. Other resources do not have to appear in tsconfig include.

Code extensions (`ts`, `tsx`, `mts`, `cts`, `js`, `jsx`, `mjs`, `cjs`, `es`) and
source maps cannot be selected. Unsupported code in the watched tree fails the
checked build rather than being copied without checks; this also makes previously
ignored `.jsx`, `.mjs` and `.cjs` inputs explicit errors in this private opt-in
coordinator. The legacy watcher is unchanged. Unselected non-code
extensions, hidden paths and `.d.ts` files are not copied. No source outside src
is copied. This deliberately does not introduce globs, remapping, loaders,
minification, file serving, content validation or permissions/mtime preservation.
Selecting an extension includes all matching non-hidden files under src, so do
not put secrets in those paths. This is intended for trusted application trees.

## Checked publication

1. Scan and fingerprint sources/resources, then snapshot selected resource bytes.
2. Generate declarations and check/emit the TypeScript project to memory using
   the existing one-program coordinator.
3. Combine compiler outputs and raw resource outputs, rejecting duplicate
   destinations. Hash their content into the build signature.
4. Re-scan source hashes. A change during checking fails before runtime writes.
5. Validate destinations, publish through the existing session ledger, and
   request one reload only after the complete batch succeeds.

Resource-only edits, additions, deletions and renames therefore participate in
the same checked batch as JS/maps. Semantic errors prevent resource writes and
cleanup. Unchanged polls do not rewrite files or reload workers. Content hashes
detect equal-size edits even when mtime is restored. Source and destination
symlinks are refused; deleting an externally edited owned output is refused.

The existing boundaries remain: runtime writes can overwrite destinations;
ownership checks protect cleanup, not a general merge of manual output edits.
Live writes/cleanup are not transactional, so disk errors can leave a partially
changed app without a reload. Staged starter builds preserve the previously
published app on checking/copy failure and replace only a marked generated app.
Their two-rename publication/rollback is not crash-safe. Full source/resource
snapshots and compiler outputs must fit in memory. Race-proof publication against
hostile concurrent filesystem mutation and persistent ledgers remain open.

The sample `/index/resource` reads an asset once when its worker starts. The
installed gate changes only that asset and observes a new HTTP value, verifying
the worker reload as well as copying. The production gate starts with just app
and runtime dependencies, without src, generated declarations or dev tools.
The starter explicitly includes a pinned TypeScript-3.9-compatible `@types/node`
14.14.31 development dependency for its fs/path example. This is a restricted
typing baseline, not support for a Node 14 runtime or every modern Node API.
Root workspace dependencies/lockfile and first-party package versions are unchanged.

## Verification

```sh
pnpm lint
pnpm test
node --test --test-concurrency=1 packages/think-ts-helper/test/development.test.js packages/think-ts-helper/test/benchmark-development.test.js
THINKJS_AUDIT_TYPESCRIPT=/path/to/typescript-5.9.3 node --test --test-concurrency=1 packages/think-ts-helper/test/development.test.js packages/think-ts-helper/test/benchmark-development.test.js
pnpm test:typescript-template
THINKJS_APPLICATION_TYPESCRIPT=5.9.3 pnpm test:typescript-template
```

The existing CI compiler matrix runs these focused tests on TS 3.9.10/5.9.3,
and its generated-template matrix exercises the full resource lifecycle. Focused
cases cover raw/binary content, ignored files, same-mtime edits, rename/delete,
JSON ownership transitions, failed-check preservation/recovery, invalid resource
rules, source changes during checking, symlinks and external-edit cleanup refusal.
Actual run results and unrun platforms are recorded in the PR.

This does not close P1 or P2. Shared strict build/lint infrastructure, package
build topology, broader generators, registry-facing template adoption, incremental
checking beyond syntax reuse, transactional publication, Windows/macOS acceptance,
and release decisions are still separate work. The legacy public JS API and
existing default workflows are unchanged.
