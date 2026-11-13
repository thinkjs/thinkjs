# P1 slice: static Controller extension types

This increment continues #1795 on top of Config generation (#1802), not on
master. It deliberately completes one reviewable Controller extension prototype,
not the entire P1 or Extend migration.

## Runtime and type boundary

`--controller-extends` / `controllerExtends: true` reads the exact runtime source
locations in order: `config/extend`, then `extend/controller`, or their `common/`
locations in a multi-module application. It accepts TS static object exports,
controller-only configuration objects and readonly tuples of those objects.
The actual application-local ThinkJS system Controller extension is inspected
as source. No application or framework extension file is evaluated for generation.

The generator selects each property's final owner. Disjoint source `Pick`s keep
method parameters/returns, explicit `this`, and getter readonlyness intact.
`ControllerExtension` supports one BaseController declaration merge, and
`AppExtendedController<T, M>` composes with existing Service/Model/Config views.
Existing `AppController` is unchanged so existing Logic adoption is not silently
promised Controller-only behavior. No global type augmentation is installed.

The runtime descriptor copier has an important constraint: redefining an
accessor without both halves retains an existing omitted getter/setter. Assigning
a data property over an accessor can call the old setter instead of replacing
it. The bounded generator rejects these ambiguous replacements and setter-only
members. It accepts getter-only over getter-only, data-to-getter, and complete
getter/setter-pair replacements. Tests cover actual descriptor retention.

Core Controller members, `ctx`, and `model` cannot be replaced in this slice.
All other allowed same-name replacements are reported as conservative
`CONTROLLER_EXTEND_OVERRIDE` diagnostics, not as a proof of assignability. The
winning type is used and semantic checking remains the application's `tsc` job.

## Acceptance coverage

- Deterministic opt-in output, manifest, CLI check, independent cleanup, source
  collisions/case/symlinks, destination ownership and error-before-write.
- Single/multi-module runtime ordering; common-only Extend paths; multiple
  configuration plugins and final application overrides.
- Real TypeScript positive/negative fixtures, all eight Model/Config/layout
  combinations with full declaration checking.
- Emitted CommonJS execution against the existing ExtendLoader and Controller
  prototypes, strict/noImplicitThis, and both class-field emit modes. Legacy
  framework adoption retains its pre-existing `skipLibCheck` boundary.
- Getter and paired-accessor behavior, explicit method receiver validation,
  detached-call rejection, wrong argument rejection and no old-signature
  intersection. No business-source cast or handwritten member registry needed.

## Explicit remaining work

Other extension targets, static imported plugin metadata, dynamic factories,
JS/JSDoc support and semantic conflict classification remain future slices.
The helper rejects unsupported inputs instead of executing or guessing them.
This patch does not provide a full installed application, a cold install,
watch/ready integration, JS output cleanup, performance budgets, source-language
migration, a new compiler support policy, a merge or a package publication.

See the helper README for usage and supported-source restrictions.
