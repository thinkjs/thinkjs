# Checked TypeScript ThinkJS prototype

This single-module starter was generated from a local ThinkJS roadmap branch.
It is a review/development prototype, not a released registry template.
Requires Node >=20.19 and pnpm 11.6.0. Use the package-manager version pinned in
package.json; do not replace first-party file dependencies with registry ranges.

```sh
pnpm install --ignore-scripts
pnpm typecheck
pnpm dev
# Stop dev before building or starting production.
pnpm build
pnpm start
```

Open http://127.0.0.1:8360/index/index. The example returns a typed Service result
using a generated Config lookup. Change src/service/greeting.ts to try live
updates. A semantic error is reported and does not replace running JS. Fixing it
reloads the worker. New/renamed/deleted services update generated declarations
and session-owned JS/map outputs.

Open http://127.0.0.1:8360/index/resource to read `src/assets/message.txt` from
the compiled app. Editing that file triggers a checked resource copy and worker
reload, just like editing a service.

- `prepare-types` creates `.thinkjs/types` for the editor, including first open.
  Installation does not silently generate files. Run it explicitly in CI too.
- `typecheck` regenerates declarations, then runs `tsc --noEmit`.
- `dev` makes a fresh checked build before starting the checked watcher and
  application. It owns one watcher; do not run a second compiler/helper watcher.
- `build` checks and emits through the same compiler program into a temporary
  directory, then replaces the template-owned `app` directory. Semantic failure
  preserves the previous build. Removed source files cannot survive a new build.
- `start` loads only emitted JS. It does not import helper, compiler or watcher.

`app/` is entirely generated. Do not store source or hand-maintained resources
there. Existing app directories without this template's ownership marker are
refused. After checking what they contain, move them aside yourself before a
first build. Never delete an unfamiliar app directory just to bypass the check.
`.thinkjs/packages` contains the current checkout's first-party npm tarballs;
keep it with package.json, pnpm-workspace.yaml and your lockfile. All paths are
relative so this generated project can be moved. Third-party packages still
need registry access or an existing package-manager cache at install time.

For a production-only installation, copy `app`, `start.cjs`,
`scripts/lifecycle.cjs`, package.json, pnpm-workspace.yaml, the lockfile and
`.thinkjs/packages`, then run `pnpm install --prod --ignore-scripts`.
No src, generated declarations, dev.cjs or scripts/checked.cjs are required.
The tarballs are a local review distribution mechanism, not an npm release.

## Non-code resources

Build and dev share `resourceExtensions` in `scripts/checked.cjs`. The starter
selects `json`, `txt`, `html` and `bin`; add lowercase extensions without dots for
other resources, then restart dev. Selected non-hidden files anywhere under src
are copied byte-for-byte to the same relative path under app. Binary content is
supported. Imported JSON remains compiler-owned and uses TypeScript's emitted
format; JSON that is not imported is copied unchanged.

Unselected extensions, hidden paths and declaration files are not copied. Code
extensions and source maps cannot be selected as resources. This is an explicit
allowlist, not a bundler, asset transformer or static-file server. Keep private
files outside the selected source paths. No files outside src are copied.
Semantic failure preserves the previous runtime resources. Live deletion/rename
uses the same session ownership checks as JS: externally changed outputs are not
deleted. A fresh build replaces the whole marked app directory, so manual app
edits are not preserved. Resource contents must fit in memory with compiler emit.

## Limits and recovery

The sample enables Service and Config generation. It does not enable Model,
Controller Extend, database drivers, glob-based resource rules or multi-module
scaffolding. The checked coordinator supports CommonJS `.ts`, imported JSON and
explicitly selected non-code resources,
not JS/TSX/MTS/CTS, project references or incremental/declaration builds. Keep
rootDir=src and outDir=app in the project config. The helper still parses TS 3.9
syntax even if the project compiler is newer. Existing JS/TS default templates
are unchanged.

The starter pins `@types/node` 14.14.31 for TypeScript 3.9 syntax compatibility
and explicitly includes those ambient types. This covers the example's fs/path
APIs, not all APIs in the required modern Node runtime. A newer compiler/Node
typing baseline is a separate compatibility decision; do not infer that Node 14
is a supported runtime from this development-only type package.

Build/dev acquire `.thinkjs/checked.lock` to prevent cooperating commands from
writing concurrently. Graceful SIGINT/SIGTERM closes the watcher and workers,
then releases the lock. SIGKILL, a power loss or process crash can leave the lock
or build directories behind. Confirm all related processes are stopped before
removing a stale lock. The lock does not protect against other tools or malicious
filesystem changes. Never build over a running production server.

Build publication uses two directory renames with rollback, not an atomic
transaction or crash-safe last-good guarantee. If rollback fails, the previous
app is preserved at the path in the error; inspect and restore it manually.
Live development writes inherit the coordinator's non-transactional behavior:
a disk/cleanup error may leave partially changed files without a worker reload.
Fresh startup rebuilds app, so the watcher's ownership ledger need not persist.

Every poll currently checks/emits the complete project in memory, reusing parsed
syntax only while source text and compiler options match. Synthetic large-project
measurements are available in the roadmap branch, but they are not an application
latency guarantee. Incremental checking and cross-platform behavior remain open. This starter does
not complete P1/P2 or the overall TypeScript migration.

The local creation command currently requires a POSIX host and explicitly rejects
Windows. Linux is tested; macOS remains untested. Windows command launching and
filesystem acceptance are follow-up work.
