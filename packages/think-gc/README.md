# think-gc
[![Build Status](https://travis-ci.org/thinkjs/think-gc.svg?branch=master)](https://travis-ci.org/thinkjs/think-gc)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-gc/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-gc?branch=master)
[![npm](https://img.shields.io/npm/v/think-gc.svg?style=flat-square)](https://www.npmjs.com/package/think-gc)


gc manager for ThinkJS 3.x

## Install

```
npm install think-gc
```

## How to use
```js
const gc = require('think-gc');

class handle {
  constructor(){
    this.gcType = 'session';
    gc(this, 3600 * 1000); //gc interval by 1 hour
  }
  gc(){
    //do gc task
  }
}
```

## TypeScript

```ts
import gc = require('think-gc');

class Store {
  gcType = 'store';
  gc() {
    // Remove expired entries.
  }
}

gc(new Store(), '1h');
gc(new Store(), () => true);
```

Registration returns `void`. The interval accepts milliseconds, a duration string,
or a predicate whose result is tested for truthiness. Neither predicate results
nor `gc()` return values are awaited. In particular, an async predicate's Promise
is truthy even when it eventually resolves to `false`.

The runtime is unchanged: one unreferenced timer serves the process, the first
registration determines its tick period, and the first registration of a type
wins. Each duration uses `Math.floor(interval / MIN_INTERVAL)` for its divisor.
The optional third argument is a numeric timer step, defaulting to one hour.
There is no new interval validation, cancellation API or error swallowing.
The existing plain-object registry and its inherited-name behavior are retained;
avoid names such as `constructor`, `toString` and `__proto__`.

For a plain object whose `gc` method reads custom state through `this`, assign
the object to a variable before registration so TypeScript can infer its self
references. Classes infer their instance members normally.

The declarations are generated from strict TypeScript and tested with TS 3.9.10
and 5.9.3. That is a package-specific tested range, not a framework-wide promise.
CommonJS still returns the function itself, including `require('think-gc/index.js')`.
No runtime or consumer type dependency on TypeScript, Node declarations, or a
ThinkJS global is introduced. Runtime dependencies and version remain unchanged.

## Development

Install workspace dependencies, then run:

```sh
pnpm --filter think-gc build
pnpm --filter think-gc typecheck
pnpm --filter think-gc test
pnpm --filter think-gc clean
```

The maintainer build uses the root TypeScript 5.9.3 compiler and emits CommonJS,
declarations and maps into `lib`. Build before requiring a fresh checkout.
`prepack` forces a rebuild, including when outputs were deleted but incremental
metadata remains; semantic errors prevent packing even with stale artifacts.
The tarball includes sources so both map formats resolve after installation.
`clean` removes current compiler outputs, not arbitrary files or orphaned outputs
from deleted sources.

Node 20.19.0 remains the runtime minimum. pnpm 11.6.0 itself requires Node >=22.13,
so the minimum-runtime CI installs tools on Node 24 and then runs tests on Node
20.19.0. Migration tests compare the compiled implementation with the frozen
legacy source using deterministic timer ticks, and install actual tarballs
offline to check CommonJS/ES import behavior and positive/negative type consumers.
