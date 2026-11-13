# think-config

Config manager for ThinkJS 3.x

## How to use

```
npm install think-config
```

```js
const Config = require('think-config');
const instance = new Config(config);
instance.get('name'); 
instance.get('foo.bar');
instance.get(); // get all config
instance.get('name', otherConfig);

instance.set('name', value);
instance.set('foo.bar', value);
```

## Opt-in TypeScript contract

The type-only `think-config/config-types` subpath provides `ConfigCall`,
`ThinkConfigs`, `ContextConfigs` and `ControllerConfigs`. It leaves the runtime
and existing framework types unchanged and requires TypeScript 3.9 or later.

`ConfigModules` explicitly describes each module's effective lookup-path values,
including dotted paths and environment-optional values. It is not a map of raw
config exports. Automatic Config source/schema generation is not implemented yet.
Use `import type`; this subpath has no runtime JavaScript module.

See [the Config contract and adoption guide](../../docs/typescript-migration/p1-config-contract.md)
for read/write dispatch, current-module typing, multi-target writes, composition
with generated Model/Service types, tested base classes, and current limits.
