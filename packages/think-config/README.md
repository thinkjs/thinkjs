# think-config

Config manager for ThinkJS 3.x

## How to use

```
npm install think-config
```

```js
const {Config} = require('think-config');
const instance = new Config(config);
instance.get('name'); 
instance.get('foo.bar');
instance.get(); // get all config
instance.get('name', otherConfig);

instance.set('name', value);
instance.set('foo.bar', value);
```

## TypeScript source and declarations

The maintainer source is now `src/index.ts`. The published runtime remains
CommonJS at `index.js`, which forwards to the compiled `lib/index.js`.
`require('think-config')` still returns `{Config, getConfigFn}`. For example:

```ts
import {Config, getConfigFn} from 'think-config';

const config = new Config({port: 8360});
const port = config.get('port'); // unknown: narrow dynamic values before use
if (typeof port === 'number') console.log(port.toFixed());
config.set('database.host', 'localhost'); // returns this for chaining

const single = getConfigFn({port: 8360}, false);
single('port', 8361); // returns the Config instance
single('port', undefined); // reads; undefined never means a factory write

const multi = getConfigFn({common: {port: 8360}, home: {port: 8361}}, true);
multi('port', undefined, 'home'); // read one module
multi('port', 8362, 'common,home'); // write selected modules; returns void
multi('port', 8363, true); // write all modules; returns void
```

Declarations are tested with TypeScript 3.9.10 and 5.9.3. Configurations are
mutable and paths may be computed, so values stay `unknown`; this migration does
not generate or infer application configuration schemas. An optional
`think-config/config-types` contract from the application-types migration remains
a separate, opt-in entry when those changes are combined. The package whitelist
retains root declaration subpaths and does not add an `exports` restriction.

Maintainer commands (from the workspace):

```sh
pnpm --filter think-config build
pnpm --filter think-config typecheck
pnpm --filter think-config clean
pnpm --filter think-config test
```

`prepack` forces a checked rebuild even if incremental metadata survived deleted
outputs. Generated JS, declarations and both map kinds are shipped alongside the
TS source; consumers do not need TypeScript. The existing dotted-path filter and
module lookup semantics are deliberately unchanged in this language migration.
