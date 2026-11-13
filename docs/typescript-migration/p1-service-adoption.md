# P1 next slice: Service adoption in existing applications

This slice is stacked on the Service prototype [#1798](https://github.com/thinkjs/thinkjs/pull/1798),
whose head is `983952c92ff81ac87bd03224f27ae0269974c02d`. It advances
[#1795](https://github.com/thinkjs/thinkjs/issues/1795) without completing P1.

## Scope and compatibility

The legacy Context and Controller declarations constrained argument two of
`service` to `string`. That excludes valid single-module calls with constructor
arguments such as numbers or objects, multi-module Controller argument
forwarding, and Context's null common-module placeholder. It also prevents
assigning legacy Context/Controller instances to every generated typed view.

Both legacy signatures now match the existing broad global compatibility
contract: `service(name: string, ...args: any[]): any`. This is an intentional
compatibility boundary, not a claim of strict checking. Existing calls remain
valid, including user-defined narrower method overrides. The existing opt-in
`thinkjs/service-types` signatures continue to provide strict name, constructor,
module-dispatch and unknown-result checks. No new `string -> any` overload is
added to those strict signatures.

No runtime implementation, new helper API, package version, dependency, lockfile,
export shape or publication workflow changes. The existing #1798 branch is not
modified. These declarations require no runtime wrapper and add no emitted code.

## Application usage

See the [helper README](../../packages/think-ts-helper/README.md#adopting-the-generated-types)
for copyable examples. Two supported paths are now tested:

1. Assign legacy Think, Context, Controller and Logic values directly to the
   generated `AppThink`, `AppContext` and `AppController` aliases, without `as`.
2. In an application's BaseController/BaseLogic, add type-only `declare service`
   and `declare ctx` annotations. Business classes inherit the base normally,
   with strict `this.service` and `this.ctx.service` lookups.

The current-module argument is an explicit application assertion about the
request module. It does not change runtime dispatch or automatically infer the
module from the source folder. Context keeps the global/common default even
inside an admin Controller. The constructor-injected Context and inherited
service method are preserved with either TypeScript class-field emit mode.

Legacy ambient globals and unannotated references intentionally remain broad.
Fluent legacy methods returning the original Controller type retain that type;
this slice does not redesign them to propagate the strict view. Use the typed
instance for strict service calls. The broader legacy declaration tree still
requires `skipLibCheck` in these integration fixtures. The standalone Service
contract continues to pass with `strict: true` and `skipLibCheck: false`.

## Verification

`service-adoption.test.cjs` creates actual single- and multi-module source trees,
runs the helper, semantically checks the generated consumers with real tsc,
emits their JavaScript and executes it using the existing CommonLoader and
Controller/Context dispatch. It runs with `useDefineForClassFields` both false
and true, including a second-level business Controller and Logic subclass.

Positive cases cover numeric/object/undefined constructor arguments, common
fallback, local override, no-cast boundaries and existing broad calls. Negative
`@ts-expect-error` cases cover misspelled services, wrong/missing constructors,
object shape mismatch and module-selection differences. Runtime checks verify
that type-only class members do not create an own `service` field, erase `ctx`,
or import a type-only module. The earlier integration fixture now also takes
real legacy Context/Controller values rather than a pretyped injection boundary.

Commands:

```sh
pnpm test:typescript-migration
THINKJS_AUDIT_TYPESCRIPT=/absolute/path/to/typescript-5.9.3 \
  node --test --test-concurrency=1 test/typescript-migration/*.test.cjs
pnpm lint
pnpm test
git diff --check
```

Final validation results are recorded in the PR. Local verification uses Linux,
Node 24.22.1 and pinned pnpm 11.6.0. The default compiler is 3.9.10; a separate
run uses 5.9.3. This is not a new all-package compiler support-floor commitment.
The existing three external-service test exclusions remain unchanged.

Model/Config module generics, Controller extension generation, installed-package
acceptance, complete application startup, source/output cleanup and watch/CLI
integration remain later slices. No merge or npm publication is requested.
