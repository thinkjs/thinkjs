# ADR 0001: CommonJS compatibility and staged type contracts

Status: accepted for this baseline batch; P1 public type names and minimum compiler remain subject to executable validation.

Context: [#1795](https://github.com/thinkjs/thinkjs/issues/1795), source baseline `aa9cdde600db87c332e5c98f704024e1a66788f4`. The current ecosystem includes deep-path consumers, dynamic module loading, hand-written declarations, registry-version fallbacks and a runtime dependency cycle.

## Decisions

1. **Preserve the runtime first.** Published code remains CommonJS. A package that currently returns a class/function from `require()` must continue doing so, using `export =` where appropriate. Do not mechanically replace `module.exports` with `export default`. No simultaneous ESM migration, algorithm rewrite or API cleanup.
2. **Preserve package entry/deep paths.** Keep `thinkjs/lib/application.js` and `thinkjs/lib/extend/*`; keep root index entries or compatible forwarding files for other packages. Do not introduce restrictive `exports` maps during the language migration. Check `main`, `types`, `files`, source/declaration maps and resources from installed tarballs, not only the source tree.
3. **Types belong to their implementation owners.** Foundational packages own their stable public contracts; `thinkjs` re-exports/augments them and hosts application registration boundaries. Avoid duplicate independent definitions. A pure, side-effect-free loader rules subpath is the first candidate for shared discovery rules. Only extract a new rules package if a proven cycle requires it.
4. **Do not replace compatibility with `any`.** Existing declarations remain unchanged in P0. P1 will establish separate, mutually exclusive strict-generated and legacy-compatible entry/configuration modes using real compiler tests. An unconstrained `string -> any` overload must not coexist with claims that misspelled literals fail. Wide strings need an honest unknown/base result; Model table names retain their base-model fallback.
5. **Model actual overloads.** Global and Context service defaults are common; Controller service calls have module inference and argument ambiguity. The prototype must preserve these distinct signatures, including module-name constructor arguments and explicit `undefined`. Context/Controller generics describe Model/Config module identity without pretending folder position changes TypeScript inheritance. Unbound contexts stay conservative.
6. **Use strict compilation when migration begins.** Unknown boundaries require type guards/local assertions. Each transitional `any` must be named and justified. Declaration compilation, a separate semantic application check, runtime tests and package-consumer tests are different gates; `transpileModule` cannot replace a program typecheck.
7. **Respect dependency cycles and non-workspace code.** Do not make `think-loader` and `thinkjs` cyclic project references. Use a reviewed declaration boundary or compatible build sequencing. Alias/range resolution must be verified from the installation before constructing a topology. The duplicate logger package needs an explicit ownership decision; it is not silently removed.
8. **Keep production independent of generators.** The helper describes application exports; it does not execute business code or instantiate services to infer types. Production runs compiled JavaScript. Generated files must be deterministic, managed-file-only, atomic and checked for staleness in P2.

## Compatibility matrix policy

- Existing repository engine declarations are `node >=20.19.0`; CI currently exercises Node 22/24/26. P0 does not change either. Node 20 support versus Node 22-only test-runner APIs must be resolved and tested before claiming a new runtime support floor.
- The legacy transpiler resolves TypeScript 3.9.10. This remains part of the old-app baseline, not the compiler chosen for new framework source.
- The existing debounce pilot uses TypeScript 5.9.3 and emits `Awaited`; its declaration language floor is at least TS 4.5. That single-package observation is not a proven ecosystem-wide floor.
- Use exact compiler versions for the P1 matrix, then lock the selected source compiler in P2. The first candidates are source compiler 5.9.3 and declaration consumer 4.5.5, alongside legacy 3.9.10 characterization; actual successful pack/declaration results decide the public minimum. Do not announce an untested “latest TypeScript” or raise the ecosystem minimum implicitly.
- TypeScript-only incompatibilities count as compatibility changes and must be listed in the eventual migration guide. Runtime bug fixes, deprecations and publishing require separately scoped review.

## Consequences and P1 checks

The first P1 implementation should be an isolated Service registry/helper slice, not a rewrite of the entire workspace. Its acceptance cases must cover class/object/traditional constructor exports, nested names, common fallback/local overrides, global/Context versus Controller behavior, wide strings, misspelled literals, strict/compat separation, default/explicit module argument ambiguity, and `@ts-expect-error` rejection tests. Extend receiver/getter precedence and Model/Config module binding also require a vertical prototype before broad migration. Only then freeze the exported names and compiler matrix.
