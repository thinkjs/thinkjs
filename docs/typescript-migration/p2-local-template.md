# P2 local checked TypeScript starter

This opt-in slice of [#1795](https://github.com/thinkjs/thinkjs/issues/1795) stacks
on [#1807](https://github.com/thinkjs/thinkjs/pull/1807). The helper remains private:
pointing the existing downloaded templates at an unpublished helper version
would make new applications fail installation. This slice deliberately adds a
repository-local creation command, not a new registry-facing CLI default.

From an installed checkout of this branch:

```sh
pnpm create:typescript-application /absolute/path/to/new-app
cd /absolute/path/to/new-app
pnpm install --ignore-scripts
pnpm typecheck
pnpm dev
# After stopping dev:
pnpm build
pnpm start
```

The destination must not exist, and its parent must exist. Scaffolding never
installs, publishes or runs package lifecycle scripts. A failed scaffold can
leave its newly reserved destination empty or partially populated; it does not
remove that directory automatically. Choose a new destination after inspecting
it. Existing files/directories/symlinks are refused before the CLI generator runs.

## Integration boundary

The local template passes through the real think-cli Metalsmith generation,
filtering, mapping, normalization and rendering pipeline. It bypasses the
legacy remote-template/cache discovery and questions. It is not yet a new
`thinkjs new` flag, does not alter published templates, and does not claim the
external template repository was updated.

The command packs the current checkout's full first-party dependency closure
with lifecycle scripts disabled. Relative tarball dependencies and pnpm
overrides cover both direct and transitive packages, including the runtime
thinkjs/think-loader cycle. The generated project is portable and installs
without workspace links; third-party dependencies still need registry/cache.
Private helper status, package versions, dependency ranges and repository lockfile
are unchanged. Publication and release/version selection remain separate work.

The generated starter contains typed Service and Config examples, a single
application base controller, tsconfig, ignore rules, explicit prepare-types,
typecheck, checked dev, checked build and production-only start. Its build uses
the #1807 compiler coordinator in a staging directory. Source maps are relocated
with the output. A checked fresh build removes obsolete app outputs before each
dev session starts, while live updates use the session ledger. An ownership
marker refuses replacement of unrelated app directories. A shared lock prevents
simultaneous cooperating build/dev commands. Signal handling closes the watcher
and clustered workers; start does not load development packages.

See the generated [README](../../templates/typescript-checked/template/README.md)
for deployment inputs and failure/recovery boundaries. Directory publication is
not a crash-safe atomic transaction. Live writes retain #1807's partial-write
risk; performance, advanced generators and full CLI/template
adoption remain open. No P1/P2 completion claim is made.

The subsequent [checked resource slice](p2-resources.md) adds an explicit shared
resource-extension allowlist to staged build and dev, with a sample asset route
and production-only resource acceptance. It does not change registry templates.

## Verification

```sh
pnpm lint
pnpm test
pnpm test:typescript-template
THINKJS_APPLICATION_TYPESCRIPT=5.9.3 pnpm test:typescript-template
```

The optional installed gate creates the project through the actual generator,
moves it before installing, checks transitive first-party package isolation,
starts from missing generated files/output, exercises semantic failure/recovery,
checks removed build outputs and lock/ownership refusal, and starts the compiled
app in a separate production-only install. It checks actual HTTP and graceful
shutdown. The existing installed-application gate remains independent.

The gate accepts the same THINKJS_APPLICATION_OFFLINE, STORE_DIR and CACHE_DIR
settings (with the full THINKJS_APPLICATION_ prefix) as the application gate.
Node/OS/compiler results are recorded in the PR; unrun matrices are not inferred
from a Linux run.

The local creation command currently requires a POSIX host and explicitly rejects
Windows. Linux is tested; macOS remains untested. Windows command launching and
filesystem acceptance are follow-up work.
