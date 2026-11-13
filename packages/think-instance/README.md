# think-instance
[![Build Status](https://travis-ci.org/thinkjs/think-instance.svg?branch=master)](https://travis-ci.org/thinkjs/think-instance)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-instance/badge.svg)](https://coveralls.io/github/thinkjs/think-instance)
[![npm](https://img.shields.io/npm/v/think-instance.svg)](https://www.npmjs.com/package/think-instance)


## Install

```
npm install think-instance
```

## How to Use

```js
const thinkInstance = require('think-instance');
let cls = class {
  constructor(conf1, conf2){

  }
}
cls = thinkInstance(cls);
const instance = cls.getInstance(conf1, conf2);
```

## TypeScript

The package includes generated declarations. CommonJS `require('think-instance')`
and `require('think-instance/index.js')` still return the wrapper function itself.
TypeScript consumers can use `import thinkInstance = require('think-instance')`,
or a default import with `esModuleInterop` enabled.

```ts
import thinkInstance = require('think-instance');

class Client {
  constructor(public name: string, public port = 80) {}
  close() {}
}

const CachedClient = thinkInstance(Client);
const client = CachedClient.getInstance('localhost', 8080);
if (client) console.log(client.name);
```

Constructor parameters, instance members and static members are retained. A class
with an existing callable `getInstance` method keeps its original type. Falsy or
nullable existing members account for the cache method that can replace them.
`getInstance` returns the instance or `undefined`: historical non-positive cache
limits can immediately evict the instance just created. Cache keys remain based
on `JSON.stringify` and eviction remains insertion-order, not least-recently-used.
Cleanup still invokes the configured method (default `close`) on the evicted
instance. Runtime errors and existing truthy `getInstance` values are not changed.
Adding a cache method assumes the constructor accepts the property. Frozen or
read-only constructors keep the original silent failed-assignment behavior.

The cache signature follows `ConstructorParameters` and `InstanceType`: overloaded
constructors use their last signature, and unspecialized generic constructors can
produce `unknown` type parameters. Use a concrete specialized class (for example,
`class StringBox extends Box<string> {}`) when a precise cache result is needed.
When replacing a declared falsy/nullable member, the constructor signature is also
reconstructed from those utility types. Ordinary constructors and classes with an
existing callable method retain their original construct signatures.

The generated declarations are checked with TypeScript 3.9.10 and 5.9.3. This is a
package-specific tested range, not a compatibility claim for all ThinkJS packages.
The maintainer build uses the workspace's pinned TypeScript 5.9.3. pnpm 11.6.0
requires Node >=22.13 for tooling; runtime compatibility tests also run on Node
20.19.0 without invoking pnpm under that older runtime. Node ambient
types are build-only and do not leak into the public declaration dependency graph.

## Development

From the workspace, install dependencies, then use:

```sh
pnpm --filter think-instance build
pnpm --filter think-instance typecheck
pnpm --filter think-instance test
pnpm --filter think-instance clean
```

`build` emits CommonJS, declarations and maps into `lib`; `prepack` forces a
rebuild even if incremental metadata remains after the outputs were deleted. The
small checked-in root entries preserve the original package path.
The tarball includes `src` so source maps resolve after installation. Runtime and
TypeScript consumers do not need the build toolchain. Generated files are ignored
in Git; after a checkout, build before requiring this package directly.

`clean` removes current compiler outputs, not arbitrary files or orphaned output
from deleted sources. The migration tests verify cold builds, failed prepack on
semantic errors, the exact tarball file list, isolated offline installation,
CommonJS/ES import behavior, maps and positive/negative declaration consumers.
