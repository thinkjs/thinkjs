# P1 slice: bounded static Config generation

This slice advances [#1795](https://github.com/thinkjs/thinkjs/issues/1795) and
stacks on the Config contract [#1801](https://github.com/thinkjs/thinkjs/pull/1801)
at `c0b80084e4fa3fa0032cdb6c3961e79157812d83`. Earlier PRs stay unchanged. It does
not complete P1, change runtime behavior, or publish a package.

## Scope

The private helper accepts `configs: true` / `--configs`, generates
`config.d.ts`, and composes the existing Config views with Service and optionally
Model. Service-only and Service/Model generation remain unchanged when Config is
not enabled. The public type contract from #1801 is unchanged.

This increment targets static object configs whose merge behavior can be proven
without executing business code. It diagnoses unsupported input before writing
any output. Arbitrary object expressions, arrays and adapters are intentionally
not described as if a shallow override or `ReturnType` were correct.

See the [helper README](../../packages/think-ts-helper/README.md#optional-static-config-generation)
for supported syntax, CLI/API usage and the type-only base-class adoption pattern.

## Source analysis and effective values

1. Use existing source/layout selection. Multi-module layout is signaled by
   common/config, and every immediate source directory is a runtime module.
2. Read immediate config.ts/js and config.<env>.ts/js files. Reject TS/JS
   collisions and symlinks. Unrelated config-directory files are not namespaces.
3. Resolve the application's installed thinkjs/lib/config/config.js. Parse its
   static defaults without requiring or evaluating it. Missing/unsupported
   system defaults fail explicitly instead of silently generating a partial map.
4. Parse supported const/object exports with pinned TS 3.9 syntax. Preserve raw
   ES namespaces: default is a property, not a Service-style unwrapped export.
   User leaf types reference source exports; known null/undefined stay explicit. System scalar leaves are widened
   primitive types; callbacks are unknown. No application module is executed.
5. For each module/environment, merge common base, local base, common env,
   local env into a user object; then merge that result over system defaults.
   This two-step order matches ConfigLoader's lodash.merge call structure.
   Plain objects recurse. Undefined keeps an existing value. Scalar replacement
   removes old child paths; later objects start a new object branch.
6. Include every discovered environment and a base-only variant. Runtime can use
   an unlisted environment, so environment-only values are always possibly
   missing. Union leaf values and optional parent-object properties describe all
   variants. A nested path through a scalar yields undefined, matching Config.get.
7. Emit all effective dotted paths into ConfigModules and compose AppThink,
   AppContext and AppController with the contract. Context module identity is
   explicit, not inferred from a source folder.

The path registry describes runtime reads, not source filenames. Application
configs must retain the source export paths visible to TypeScript; explicit type
assertions or annotations (including JSDoc types) that hide/change their structure are not accepted in
this slice. Mutable changes made later outside these typed views can invalidate
any static schema, just as in the existing explicit Config contract.

## Supported boundary and diagnostics

The supported subset includes object literals, unannotated const aliases,
shorthand fields, scalar literals, static numeric expressions, as-const, and
function/arrow values. JavaScript CJS property assignments and whole-object exports,
TS export-assignment, and ES default/named const exports are supported. CommonJS
assignments in .ts are diagnosed because TypeScript does not expose them as
module exports; the diagnostic directs users to export-assignment or .js.

The parser rejects factories exported as the root config object, dynamic values,
imports/re-exports, mutation statements, arrays, spreads, accessors, methods,
computed keys, mixed export styles and unsafe keys. Inherited names are rejected
because lodash can retain inherited values when given undefined. Literal dotted
keys cannot be represented as Config.get object paths. Nonempty comma-free module
names are required by the Config contract; __proto__ modules are unsupported.

Any adapter config file is diagnosed, even an empty one, because accepting a
subset while silently ignoring another environment would misrepresent the final
runtime merge. Adapter common/handle normalization, array index merges and
explicit metadata for dynamic sources are follow-up work. Applications outside
this subset can keep using #1801's explicit ConfigModules schema without the
Config-generation option. No permissive any fallback is added.

No environment argument is added here. The output is a conservative view over
all source environment variants, not a promise that the current process runs a
specific environment. A future environment-specific mode must be explicit.

## Output lifecycle

Config sources/environments are recorded in manifest.configs. Add/remove/rename
changes references and path types on regeneration. Generation and check options
must match. Check is read-only, including opt-out cleanup.

Disabling Config removes only the previous helper-owned config.d.ts. Model
cleanup remains independent. All generated destinations and stale optional files
are validated for ownership/symlinks before any write/removal. An error preserves
old output, but exits nonzero; callers must stop the pipeline on that error.
Atomicity remains per file, not a transaction or concurrent-generation protocol.
No application JS is deleted, and no watcher or build orchestration is added.

## Verification

- Helper tests cover deterministic source references, non-execution, module/env
  manifests, raw namespace behavior, unsupported syntax, adapter diagnostics,
  source collisions, output ownership/symlinks, read-only checks and opt-out.
- Semantic positive/negative fixtures run on TS 3.9.10 and TS 5.9.3 with full
  declaration checking for single/multi layouts with/without Model composition.
- Emitted source files are loaded by real ConfigLoader/getConfigFn for base-only,
  production and staging environments, checking system defaults, merge ordering,
  undefined preservation, branch replacement, missing fields and raw namespaces.
- Existing Controller/Logic adoption tests now use automatic Config generation,
  with no manual registry. They compile and execute both class-field emit modes.
  Legacy framework integration still needs skipLibCheck; standalone types do not.

```sh
pnpm test:typescript-migration
node --test packages/think-ts-helper/test/*.test.js
THINKJS_AUDIT_TYPESCRIPT=/absolute/path/to/typescript-5.9.3 \
  node --test --test-concurrency=1 test/typescript-migration/*.test.cjs
pnpm lint
pnpm test
git diff --check
```

Exact final results are recorded in the PR. Dependencies/lockfile/package versions
are unchanged. This is not cold-install or full installed-application acceptance.
Extend inference, adapter/dynamic Config inference, source/output cleanup,
watch/build integration and framework source migration remain separate work.
