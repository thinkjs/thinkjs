# P0 validation record

Source baseline: `aa9cdde600db87c332e5c98f704024e1a66788f4`. Recorded on 2026-11-13, Linux x64, Node 24.22.1, pnpm **11.6.0** (the repository pin). No package implementation/declaration/version or lockfile changes were made for this batch.

The default shell `pnpm` wrapper in this executor reports 11.25.0. The runs below explicitly used a separately installed 11.6.0 binary, verified with `--version`, and prepended its bin directory to PATH so nested package scripts used the same pinned version. The portable commands below assume `pnpm --version` reports 11.6.0. A writable temporary HOME was used where noted.

## Commands and observed outcomes

| Check | Result |
| --- | --- |
| `pnpm install --offline --frozen-lockfile --store-dir <existing-store>` | Passed with the unchanged lockfile. Reused 1,668 packages; this does not prove a cold network install. |
| `pnpm lint` on the baseline | Passed across the workspace. Existing logger warnings are not errors. |
| `pnpm test` with an unwritable default home | Failed when CLI tests attempted to create `~/.think-templates`. This was a test-environment limitation, not a source regression. |
| `HOME=<writable-temporary-home> pnpm --no-bail -r --if-present --filter './packages/**' --filter '!think-cache-memcache' --filter '!think-memcache' --filter '!think-mongo' test` | Passed. 69 package test scripts completed. Node test reports total 1,279 tests: 1,272 passed and 7 todo; no failed/cancelled/skipped tests. Legacy Mocha contributes one additional passing test. Some package test scripts run lint only. |
| `HOME=<writable-temporary-home> pnpm test` on the baseline | Passed using the ordinary root command, not only the no-bail diagnostic command. |
| `pnpm run test:typescript-migration` | Passed: 23 tests (6 inventory, 9 runtime contracts, 8 type/toolchain). Includes generated inventory drift check. |
| `pnpm run lint:typescript-migration` | Passed, including JS fixtures. TS fixtures are compiled by the toolchain suite, not parsed as JavaScript by ESLint. |
| Final `HOME=<writable-temporary-home> pnpm lint` | Passed, including the new migration lint gate and the unchanged workspace lint selection. |
| Final `HOME=<writable-temporary-home> pnpm test` | Passed: 23 new migration tests, then all 69 previously selected package scripts. This still intentionally excludes the three existing external-service packages. |
| `git diff --check` | Passed. |
| Independent `pnpm --filter think-cache-memcache test` | Did not complete within 30 seconds (outer timeout 124); no Memcached server available. Not passed. |
| Independent `pnpm --filter think-memcache test` | Did not complete within 30 seconds (outer timeout 124); no Memcached server available. Not passed. |
| Independent `pnpm --filter think-mongo test` | Did not complete within 30 seconds (outer timeout 124); no MongoDB server available. Not passed. |

Loopback readiness probes returned `ECONNREFUSED` for 6379, 11211 and 27017. The default included tests passed without those services in this run; that does not validate the omitted adapters. The bounded integration attempts were cancelled after timeout, and their incomplete/cancelled test output must not be counted as success.

Compiler-specific and pilot pack results are recorded separately in [types-and-toolchain.md](types-and-toolchain.md). The final root checks include the new P0 suite before the unchanged workspace test selection.

## Independent external-service execution plan

Use isolated, disposable development services, not a shared or production database. These commands are a reproducible **plan**, not an executed container run. A Docker-equipped integration runner can start the following fixtures; bind only loopback and remove them afterward:

```sh
docker run --rm -d --name thinkjs-p0-memcache -p 127.0.0.1:11211:11211 memcached:1.6-alpine
docker run --rm -d --name thinkjs-p0-mongo -p 127.0.0.1:27017:27017 mongo:4.4
```

MongoDB 4.4 is a deliberately legacy, throwaway compatibility target for the installed `mongodb` 3.x driver, not a recommendation to deploy an unsupported database. Pin image digests in the eventual integration CI after validating supported combinations. Do not assert the current driver works with an arbitrary latest MongoDB version.

Wait for each service to be ready, then run these **separately**, retaining each exit status and log:

```sh
pnpm --filter think-cache-memcache test
pnpm --filter think-memcache test
pnpm --filter think-mongo test
```

The Memcache packages use the driver's default local server/port 11211. Mongo fixtures use 127.0.0.1:27017 and the disposable `think_db` database. Legacy tests may have cleanup/driver compatibility defects even after services start; record and fix them in an independently reviewed batch rather than silently excluding them again. A runner timeout should fail the integration job, not turn it green.

For CI parity, the existing workflow also provisions `redis:7-alpine` on 6379. Maintain that existing service configuration. No workflow, service version, or excluded-package policy is changed here.

After testing:

```sh
docker stop thinkjs-p0-memcache thinkjs-p0-mongo
```

## Not yet validated

- Node 20, 22 or 26 execution, Windows paths/case behavior, or a new support-floor claim.
- A cold install with an empty dependency cache.
- Successful live Memcached/MongoDB integration or a complete SQL/adapter service matrix.
- Full generated JS and TS apps through install → typecheck → dev/watch → build → production HTTP startup. P0 freezes isolated old-loader/transpiler behavior; P2/P5 own application acceptance.
- Helper generation/watch/cache/atomic writes, public registry overloads, source migration or performance budgets. Those are P1 onward.
- npm publication, new stable package versions or upstream PR CI. Nothing was pushed, merged or published as part of this validation.
