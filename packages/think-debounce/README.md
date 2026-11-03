# think-debounce
[![Build Status](https://img.shields.io/travis/thinkjs/think-debounce/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-debounce)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-debounce/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-debounce?branch=master)
[![npm](https://img.shields.io/npm/v/think-debounce.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-debounce)

`think-debounce` runs a time-consuming operation. The operation may be called several times concurrently, but within `think-debounce`, it will only be run once before it's finished.

In particular, You can use `think-debounce` to avoid duplicate requests for a remote API.

## Syntax

```js
import Debounce from 'think-debounce';
const instance = new Debounce();
instance.debounce(key, callback);
```

- `key` {String} the identity of the operation.
- `callback` {Function} the function which contains the operation and returns a Promise object.
- return {Object} a Promise object.

## Usage

Take reading a local file for an example:

```js
import Debounce from 'think-debounce';
import fs from 'fs';

let instance = new Debounce();
let readTimes = 0;
let awaitKey = 'readMyFile';
let filePath = '../my/file/path';
let readMyFileCallback = () => {
  return new Promise((resolve, reject) => {
    // even if `readMyFile` operation is called several times,
    // `readMyFileCallback` will only be run once before it's finished.
    readTimes ++;
    fs.readFile(filePath, {encoding: 'utf8'}, (err, data) => {
      if(err) reject(err);
      resolve(data);
    });
  });
}

let promise1 = instance.debounce(awaitKey, readMyFileCallback);
let promise2 = instance.debounce(awaitKey, readMyFileCallback);

return Promise.all([promise1, promise2]).then(values => {
  console.log(readTimes); // 1
});
```

## TypeScript migration pilot

The implementation now lives in `src/index.ts`. Run `npm run build` to generate
`index.js` and `index.d.ts`; both generated files are checked in so existing
workspace JavaScript consumers can still require this package without a build.
Do not edit the generated files directly. `npm pack` rebuilds them automatically.
The runtime entry point remains `index.js` and exports the constructor directly
using CommonJS. No runtime dependencies or package version changes are added.

```ts
import Debounce = require('think-debounce');

const instance = new Debounce();
const result: Promise<{id: number}> = instance.debounce('record', async () => ({id: 1}));
```

Synchronous values and promise-like callback results are inferred and unwrapped.
The generated declarations require TypeScript 4.5 or newer (`Awaited`); this pilot
uses TypeScript 5.9.3. Default imports work with `esModuleInterop` enabled.
Use the same callback result type for all concurrent calls sharing a key. The
runtime deduplicates by string key, so TypeScript cannot verify that two separate
calls with the same key return the same type. The public `queues` property is
retained for compatibility but is an implementation detail.

### Validate locally

From the repository root, install with the repository's pnpm version and run:

```sh
pnpm install --frozen-lockfile
pnpm --filter think-debounce test
pnpm --filter think-debounce coverage
pnpm --filter think-debounce test:pack
cd packages/think-debounce
npm pack
```

`test` builds the source, lints generated JavaScript and the new test helpers,
checks source and consumer types, and runs the existing tests plus regressions.
`test:pack` creates a real tarball, checks its exact file list, installs it into a
temporary directory without lifecycle scripts or development dependencies, then
runs JavaScript and strict TypeScript consumers against the installed package.
It removes that temporary directory afterward. The published package contains
only `index.js`, `index.d.ts`, `package.json`, `README.md`, and `LICENSE`.

This is a source-language migration, not a behavior fix. It preserves microtask /
`process.nextTick` cleanup timing and the original plain-object queue storage.
Consequently, inherited object-property keys such as `toString` and `__proto__`
remain unsupported by the existing implementation. That issue should be fixed
separately rather than hidden in a TypeScript-only pilot. This small package does
not validate framework-wide migration or database-backed packages.
