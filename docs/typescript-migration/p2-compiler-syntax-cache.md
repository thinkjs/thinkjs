# P2 checked-development syntax reuse and measurements

This bounded follow-up to [#1808](https://github.com/thinkjs/thinkjs/pull/1808)
advances [#1795](https://github.com/thinkjs/thinkjs/issues/1795). It reduces repeated
parser work in the opt-in checked-development coordinator. It does not introduce
incremental semantic checking, change the legacy watcher/transpiler, migrate the
framework source compiler or complete P1/P2.

## What is cached

Each watcher retains parsed TypeScript SourceFiles for its most recent program.
Every poll still generates declarations, reads current source/declaration/library
text, creates a fresh compiler host and program, resolves modules, checks the
whole project and emits to memory. The existing output fingerprint suppresses
unchanged runtime writes/reloads only after those steps.

A cached syntax tree is reused only when its full source text, parsed compiler
options and compiler-supplied parse options match. A compiler request for a fresh
SourceFile is honored. The compiler's original host constructs new syntax trees,
so script kind, module detection and other parser flags stay compiler-owned.
Config parsing, existence checks, module/package resolution and semantic
results are not cached. There is no mtime-only fast path and no old Program
passed to createProgram.

Only SourceFiles requested by the latest program remain retained. Rename,
deletion and changed dependency resolution evict old entries; close releases the
cache, including before a later restart. Memory is bounded by the latest source
graph, **not** by a fixed byte limit. The private `lastCompilerCache` measurement
records parsed/reused/retained file counts. It is instrumentation, not a stable
public cache-management API.

The previous output-ownership and publication boundaries remain unchanged. This
is not a transactional filesystem snapshot or protection against concurrent
hostile edits. Nontransactional live output writes remain an open concern.

## Reproduce the measurements

```sh
pnpm --filter think-ts-helper benchmark:development 1000 5 single
pnpm --filter think-ts-helper benchmark:development 1000 5 multi
THINKJS_AUDIT_TYPESCRIPT=/absolute/path/to/typescript \
  pnpm --filter think-ts-helper benchmark:development 1000 5 multi
```

Run these commands from an installed repository checkout. The benchmark reads
the sibling thinkjs contract and think-watcher package; it is not an installed
standalone-helper command.

Arguments are service source-file count (3–10,000), samples per warm scenario
(1–100), and single/multi layout. Each command uses a fresh temporary application
and removes only that directory afterward. The compiler dependency is loaded
before the cold poll and reported separately as `loadMs`. For an identical-workload
comparison, `THINKJS_BENCHMARK_HELPER=/absolute/path/to/old/think-ts-helper` selects
a previous coordinator implementation without changing the fixture or compiler.

The workload uses actual generated Service declarations and the real standalone
thinkjs/service-types contract, with strict checking and skipLibCheck disabled.
It contains normal classes and one typed service-lookup consumer. Multi layout
uses common/home/admin with local overrides. This is a controlled compiler
workload, not a representative business application with hundreds of lookup
sites, plugin declarations, framework bootstrap, HTTP requests or an IDE.

JSON reports include cold, unchanged and edited poll wall/CPU time; unchanged
and edit median/max across the requested samples; error, recovery and rename
costs; syntax work counts; and whole-process maximum RSS. CPU includes all process
threads and may exceed wall time. Peak RSS includes compiler loading, fixture
setup and every scenario, not just retained cache memory. Compiler/OS caches are
not flushed, the host may be shared, and one run is not a statistical speedup
claim. The 500 ms polling interval is additional time after each poll and is not
included. Error preservation, no reload on unchanged polls, recovery and stale
rename cleanup are asserted during measurements.

## Local baseline observation

Linux x64 / Node 24.22.1, 1,000 service files, five warm samples per scenario.
Values are milliseconds, baseline #1808 → syntax reuse. The cold sample is
reported separately from the median warm scenarios.

| TypeScript | Layout | Cold | Unchanged median | Edit median |
| --- | --- | --- | --- | --- |
| 3.9.10 | single | 2176 → 2892 | 1384 → 1004 | 1747 → 1703 |
| 3.9.10 | multi | 8899 → 6950 | 5687 → 4546 | 5673 → 5075 |
| 5.9.3 | single | 2493 → 2438 | 1295 → 964 | 1971 → 1562 |
| 5.9.3 | multi | 5467 → 4924 | 4667 → 4019 | 5320 → 4817 |

[Raw wall/CPU/RSS measurements](measurements/p2-compiler-syntax-cache-linux-node24.json)
retain all scenarios and machine/compiler metadata. These observations do not
establish a percentage speedup or cold-start improvement. Most importantly,
multi-module idle checking still takes several seconds, and every unchanged
poll still consumes CPU. Do not infer that this prototype is suitable for
large applications merely because parser work was reduced.

## Acceptance budgets and remaining gate

Deterministic work budgets are enforced in tests on TypeScript 3.9.10 and 5.9.3:

- An unchanged successful poll parses **zero** program SourceFiles again.
- Changing only one existing service's method body parses **one** SourceFile.
- Both cases still run semantic checking; adding/deleting/renaming files,
  changing dependent declarations/package metadata, and changing inherited
  compiler options must produce fresh-program-equivalent results.
- Removed sources do not accumulate, and close retains **zero** SourceFiles.

These are parser-work budgets, not latency or total CPU budgets. CI also reports
1,000-service single/multi timings as downloadable artifacts without hardware-
dependent timing failures. Real application cold-start/edit latency targets and
acceptable idle CPU/memory must still be selected against representative projects.
In particular, every unchanged poll still performs full semantic checking and
emission. Syntax reuse alone does not make frequent large-project polling cheap.
P1's overall performance/adoption gate therefore remains open.

## Verification

The focused suite includes same-length/same-mtime changes, changed/deleted/restored
dependency declarations, package `types` redirection, newly created dependencies,
inherited options, pruning/restart, and warm-versus-cold diagnostic code/message and emitted-output
parity through global interface merging and const-enum changes. Existing checked
development and installed HTTP/template gates remain required.

Local measurements and validation results are recorded in the PR. Node/OS/
compiler combinations not executed must not be inferred as passing. No package
versions, dependency ranges, lockfile, registry defaults or publish policy change.
