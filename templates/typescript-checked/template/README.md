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

## Limits and recovery

The sample enables Service and Config generation. It does not enable Model,
Controller Extend, database drivers, general resource copying or multi-module
scaffolding. The checked coordinator supports CommonJS `.ts` and imported JSON,
not JS/TSX/MTS/CTS, project references or incremental/declaration builds. Keep
rootDir=src and outDir=app in the project config. The helper still parses TS 3.9
syntax even if the project compiler is newer. Existing JS/TS default templates
are unchanged.

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

Every poll currently checks/emits the complete project in memory. Large-project
performance and cross-platform behavior remain unvalidated. This starter does
not complete P1/P2 or the overall TypeScript migration.

The local creation command currently requires a POSIX host and explicitly rejects
Windows. Linux is tested; macOS remains untested. Windows command launching and
filesystem acceptance are follow-up work.
