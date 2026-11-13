# P0 runtime compatibility contract

Baseline: `aa9cdde600db87c332e5c98f704024e1a66788f4`. This is a record of existing JavaScript behavior, not a new runtime specification. A TypeScript migration must distinguish the different entry points rather than make their signatures appear interchangeable. No runtime source, existing declaration, package version or lockfile is changed by these fixtures.

## Validation

- `node --test test/typescript-migration/runtime.test.cjs`: 9 tests pass.
- `node_modules/.bin/eslint test/typescript-migration/runtime.test.cjs 'test/typescript-migration/fixtures/**/*.js'`: passes without warnings. The fixtures live under `test/typescript-migration/fixtures`, so the existing `**/test/fixtures/**` ignore does not exclude them.
- Tests use real workspace implementations; `global.think` and its cache entry are restored between tests. Adapter construction is inert, with no server or database connection.
- “Tested” below means asserted by this suite. “Source only” means inspected but not separately executed by this suite.

## Services and controllers

| Case | Baseline behavior | Coverage / source |
| --- | --- | --- |
| Single-module service | `think.service(name, ...args)` passes all arguments after the name to construction. A name-only call supplies `[undefined]`, not an empty argument list. | Tested; [think.js:66–76][service] |
| Multi-module service | Second argument is module, defaulting to common; later arguments reach the constructor. An unknown module does not fall back to common and missing services assert. | Tested; [think.js:66–76][service] |
| Class or ordinary constructable function export | Called with `new`, producing a fresh instance. | Tested; [think.js:73–76][service] |
| Object export | Returned unchanged with stable identity. | Tested; [think.js:73–76][service] |
| Arrow export | Unsupported: CommonLoader attempts `arrow.prototype.__filename` and throws TypeError. Directly inserting an arrow in the registry bypasses that failure but `think.service` throws when constructing it. It is not a service factory. | Both failures tested; [common.js:7–24][load-files], [think.js:73–76][service] |
| Nested name / default export | Slash-separated relative name remains the lookup key; `__esModule.default` is unwrapped. Function prototypes receive `__filename`. | Tested; [common.js:7–24][load-files], [util.js:8–23][util] |
| Common inheritance | Common exports merge into each module; module-local exports win. | Tested; [common.js:43–65][load-common] |
| Context.service | Forwards arguments unchanged to global service. Context module is **not** injected. | Tested; [context.js:295–297][context-service] |
| Controller.service, single-module | Forwards unchanged. | Tested; [controller.js:248–262][controller-service] |
| Controller.service, multi-module | If argument 2 names a registered module, forwards it. Otherwise, if a service exists in the context module's merged registry, inserts that module before constructor arguments. If no such registry/service exists, forwards unchanged. | Tested; [controller.js:248–262][controller-service] |

### Module/argument ambiguity that declarations must preserve

Given `ctx.module === 'admin'`, registered modules `common` and `admin`, and different `shared` services in both:

- `ctx.service('shared')` selects common; `controller.service('shared')` selects admin.
- `controller.service('shared', 'common')` selects common with no constructor arguments.
- `controller.service('shared', 'payload')` selects admin and passes `'payload'` to the constructor.
- `ctx.service('shared', 'payload')` looks for a module named payload and throws.
- A constructor argument equal to a registered module name is interpreted as that module by Controller, so module names cannot be treated as arbitrary argument strings without accounting for this ambiguity.

These are compatibility constraints, not reasons to change runtime behavior in P0. A future declaration phase needs explicit entry-point overloads or documented conservative types.

## Models

| Case | Baseline behavior | Coverage / source |
| --- | --- | --- |
| Global model lookup | Defaults to common; uses module-specific registry when multi-module. Unknown model names fall back to the base Model. Unknown modules use an empty registry. | Tested; [index.js:28–49][model] |
| Nested model | Lookup retains the nested key but constructor receives the basename. `instance.models` is the same selected registry object. | Tested; [index.js:28–35][model] |
| Context and Controller | Context defaults registry module to `this.module`; Controller delegates to its Context. | Tested; [index.js:60–85][model-context] |
| Explicit Context model module | Changes registry, but model/cache configuration still comes from the Context's current module. Global model instead uses the explicit module for configuration too. | Tested; [index.js:43–48][model], [index.js:69–73][model-context] |
| Single-module model | Uses the flat registry; configuration override merges into selected adapter config. | Tested; [index.js:28–49][model] |
| DB reuse and transactions | No database/transaction behavior is claimed by this suite. | Not executed; [index.js:74–82][model-context] |

## Configuration

| Case | Baseline behavior | Coverage / source |
| --- | --- | --- |
| Read/write arguments | `undefined` in position 2 means read; a second string means a write value, not a module. Explicit null is assignable. No name returns the whole configuration. | Tested; [index.js:18–35][config], [index.js:75–104][config-fn] |
| Dot paths | Nested object paths are read; missing/intermediate non-object paths return undefined. Array indices are not traversed (`list.0` returns undefined). Writes create missing objects and replace scalar intermediates with objects. | Tested; [index.js:18–62][config] |
| Single-module setters | Return the Config instance; module argument is ignored. | Tested; [index.js:75–83][config-fn] |
| Multi-module reads | Default common; an unknown module falls back to common. | Tested; [index.js:84–89][config-fn] |
| Multi-module writes | Third argument selects one module, comma-separated modules, or `true` for all. Unknown entries are ignored; return value is undefined. | Tested; [index.js:91–104][config-fn] |
| Context / Controller defaults | Use request module, unlike the global common default; explicit third argument overrides. | Tested; [context.js:158–160][context-config], [controller.js:92–94][controller-config] |
| File precedence | System defaults, then common base → module base → common environment → module environment. Adapter config is merged afterward. | Four application layers tested; system/adapter final composition source only; [config.js:19–38][config-load], [config.js:125–159][config-paths] |
| Merge semantics | Objects deep-merge. Arrays merge by index; shorter overrides retain trailing base elements. | Tested; [think-helper/index.js:92][merge] |
| Config ES-module interop | `loadConfigByName` uses plain `require`, not `interopRequire`. Do not assume service default-export unwrapping works for config files. | Source only; [config.js:19–25][config-load] |

## Extensions

| Case | Baseline behavior | Coverage / source |
| --- | --- | --- |
| Precedence | System extensions → config entries in array order → application extension files. | Tested; [extend.js:39–70][extensions] |
| Multi-module scope | Reads common config and common extension files only; module-specific extension files are ignored. | Tested; [extend.js:29–36][extensions], [extend.js:62–69][extensions] |
| Receiver / descriptors | Methods preserve dynamic `this`; getters/setters survive both loader merging and installation. Controller body getter/setter forwards to its Context. | Tested; [util.js:28–61][util] |
| Getter-only collision | Assigning a plain value over an existing getter-only property does not replace the getter. The configured `isGet: 'configured'` fixture retains the system getter. Do not promise unconditional last-write-wins for descriptor conflicts. | Tested; [util.js:28–61][util] |
| Function config entries | Logged as errors and skipped, not invoked as extension factories. Call a factory yourself before putting its result in the config array. | Source only; [extend.js:51–60][extensions] |
| Unsupported extension targets | Loader asserts when a target is outside `allowExtends`. | Source only; [extend.js:17–17][extensions], [extend.js:57–59][extensions] |

[service]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/thinkjs/lib/think.js#L66-L76
[load-files]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-loader/loader/common.js#L7-L24
[load-common]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-loader/loader/common.js#L43-L65
[util]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-loader/loader/util.js#L8-L61
[context-service]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/thinkjs/lib/extend/context.js#L295-L297
[controller-service]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/thinkjs/lib/extend/controller.js#L248-L262
[model]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-model/index.js#L28-L49
[model-context]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-model/index.js#L60-L85
[config]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-config/index.js#L18-L62
[config-fn]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-config/index.js#L75-L104
[context-config]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/thinkjs/lib/extend/context.js#L158-L160
[controller-config]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/thinkjs/lib/extend/controller.js#L92-L94
[config-load]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-loader/loader/config.js#L19-L38
[config-paths]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-loader/loader/config.js#L125-L159
[merge]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-helper/index.js#L92
[extensions]: https://github.com/thinkjs/thinkjs/blob/aa9cdde600db87c332e5c98f704024e1a66788f4/packages/think-loader/loader/extend.js#L17-L70
