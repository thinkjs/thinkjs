# P1 slice: generated custom Model lookups

This increment advances [#1795](https://github.com/thinkjs/thinkjs/issues/1795),
stacked on the Service adoption PR [#1799](https://github.com/thinkjs/thinkjs/pull/1799)
at `23352b9dd933824b64a0a793230cb73f59effb10`. It does not complete P1.

## Contract and ownership

`think-model/model-types.d.ts` owns an explicitly enabled, type-only
`ModelModules` registry and lookup views. No package root augmentation, runtime
wrapper, entry-point/export change, dependency change or publication is added.
`think-ts-helper --models` (or `generate({models: true})`) discovers model source
exports using the existing layout/interop rules, adds effective model maps to
its manifest, and composes Model and Service views in its generated index.
Service-only generation retains its previous output bytes.

The existing ORM owns the fallback Model type. The new views infer it from the
base host's `model` return type. Custom constructors must produce compatible
instances and accept the runtime's name/config arguments. Invalid known exports
cannot escape through a broad unknown-table overload. Constructor configuration
uses the broad parsed `object` boundary until adapter schemas are typed; the call accepts an adapter name or config object,
not arbitrary additional constructor arguments.

Global and Service lookup default to common. Context/Controller/Logic default
to their current request module. Explicit module selection remains argument
three, including an undefined config placeholder. Unknown modules do not inherit
common. Single-module lookup ignores the third argument. Model names, unlike
Service names, allow ordinary unregistered table literals and return the base
ORM. No row/projection/result inference is claimed.

The README contains the tested base Controller/Logic adoption pattern using
`declare model`, `declare service` and a module-bound `declare ctx`. Business
subclasses add no casts, manual registry, wrapper or emitted fields. No native
`Controller<M>` class signature is changed. The generated Context view's new
module parameter affects Model lookup only, not Service's common default.

## Honest boundaries

- Legacy ambient types and global lookup remain unchanged. The broad legacy
  Model return cannot prove custom methods when assigned to a typed view,
  unlike legacy Service's `any`. Model adoption is tested through base-class
  declarations; Service-only direct assignment remains supported.
- Union names/modules yield unions. An unbound current module includes the base
  fallback. A module type parameter is an explicit assertion about runtime
  context, not inference from a filename.
- Existing model maps are ordinary objects. Unknown inherited keys can throw
  or produce a non-ORM object (`constructor` resolves Object). The opt-in type
  rejects these literals unless a valid own registered model overrides them.
  Wide-string names are rejected because they might select such keys; validate
  and narrow, or use the unchanged legacy API. `__proto__` model/module keys are
  rejected by generation because the runtime loader mutates prototypes for them.
- Disabling Model generation removes only its prior manifest-owned declaration,
  after ownership/symlink validation. No source or compiled application file is
  deleted. Atomic replacement remains per file, not a multi-file transaction.
- Legacy ORM and ThinkJS declarations still require `skipLibCheck` in application
  integration tests. The standalone contract and a generated Model/Service view
  composition both pass with full declaration checking. Neither is a claim that
  the entire legacy declaration graph is repaired.

## Verification

The added fixtures semantically compile and execute single/multi-module apps,
using real CommonLoader, think-model, Controller and Logic implementations.
Both TypeScript class-field emit modes are exercised. They verify common/local
mapping, inheritance, nested names, ES default/export=/CommonJS classes, ordinary
table fallback, unknown module fallback, config string placement, undefined
placeholders, explicit own `constructor` models, and Service composition.
Standalone positive/negative tests also cover constructor incompatibility,
partially invalid export unions, name/module unions, unbound context, inherited
names and dynamic-name restrictions. No database connection is needed.

Generator tests cover opt-in isolation, no source execution, stable bytes,
renames/deletions, CLI checks, collisions, unsafe keys, ownership, symlinks and
cleanup when the feature is disabled. Tests on TypeScript 3.9.10 and 5.9.3 use
real semantic checking, not only transpilation.

```sh
pnpm test:typescript-migration
THINKJS_AUDIT_TYPESCRIPT=/absolute/path/to/typescript-5.9.3 \
  node --test --test-concurrency=1 test/typescript-migration/*.test.cjs
pnpm lint
pnpm test
git diff --check
```

Actual final results and environment limits are recorded in the PR. Config,
Extend, record/query generics, watch/CLI development integration, full installed
application acceptance and source/output cleanup remain future slices. No merge
or npm publication is requested.
